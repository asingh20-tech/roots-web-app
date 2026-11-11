import mimetypes
import os

from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.db.models import Q
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.generics import (
    ListAPIView,
    ListCreateAPIView,
    RetrieveAPIView,
    RetrieveDestroyAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Document,
    FamilyMember,
    FamilyTree,
    Invitation,
    Relationship,
    SuggestionStatus,
    SuggestRequest,
    TreeCollaborator,
)
from .permissions import IsTreeOwner, IsTreeOwnerOrReadOnly, SuggestionPermission
from .serializers import (
    CollaboratorSerializer,
    DocumentSerializer,
    FamilyMemberDetailSerializer,
    FamilyMemberSerializer,
    FamilyTreeSerializer,
    InvitationSerializer,
    MemberPhotoSerializer,
    RelationshipSerializer,
    SearchResultSerializer,
    SuggestionSerializer,
    invitation_url,
)
from .services import OutdatedSuggestion, approve_suggestion, mark_outdated, reject_suggestion

SEARCH_LIMIT = 50


# ---------- Trees ----------

class FamilyTreeListCreateView(ListCreateAPIView):
    """GET: trees the user owns or collaborates on (DB-4).
    POST: create a tree; the user becomes its Tree Owner (FR-3)."""
    serializer_class = FamilyTreeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            FamilyTree.objects.accessible_to(self.request.user)
            .with_member_count()
            .order_by("-created_at", "-id")
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class FamilyTreeDetailView(RetrieveUpdateDestroyAPIView):
    """GET: owner or collaborator. PATCH/PUT/DELETE: owner only (SA-1).
    DELETE cascades to members, relationships, suggestions, documents,
    invitations, and collaborators (DB-6)."""
    serializer_class = FamilyTreeSerializer
    permission_classes = [IsAuthenticated, IsTreeOwnerOrReadOnly]

    def get_queryset(self):
        return FamilyTree.objects.accessible_to(self.request.user).with_member_count()


# ---------- Tree-scoped base ----------

class TreeScopedMixin:
    """Resolves /api/trees/<tree_id>/... to a tree the user can access.
    Outsiders get 404 so the tree's existence isn't revealed (DC-4)."""
    permission_classes = [IsAuthenticated, IsTreeOwnerOrReadOnly]

    def get_tree(self):
        if not hasattr(self, "_tree"):
            self._tree = get_object_or_404(
                FamilyTree.objects.accessible_to(self.request.user),
                pk=self.kwargs["tree_id"],
            )
        return self._tree

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if "tree_id" in self.kwargs:
            context["tree"] = self.get_tree()
        return context


# ---------- Members (FR-4) ----------

class FamilyMemberListCreateView(TreeScopedMixin, ListCreateAPIView):
    """GET: list members. POST: add a member (owner only)."""
    serializer_class = FamilyMemberSerializer

    def get_queryset(self):
        return FamilyMember.objects.filter(tree=self.get_tree()).order_by("last_name", "first_name")

    def perform_create(self, serializer):
        serializer.save(tree=self.get_tree())


class FamilyMemberDetailView(TreeScopedMixin, RetrieveUpdateDestroyAPIView):
    """GET: member profile with documents (FR-9). PATCH/PUT: edit. DELETE: remove (owner only).
    Deleting a member also deletes their relationships and files."""

    def get_serializer_class(self):
        return FamilyMemberDetailSerializer if self.request.method == "GET" else FamilyMemberSerializer

    def get_queryset(self):
        return FamilyMember.objects.filter(tree=self.get_tree()).prefetch_related("documents")


# ---------- Relationships (FR-5) ----------

class RelationshipListCreateView(TreeScopedMixin, ListCreateAPIView):
    """GET: list relationships. POST: link two members (owner only).
    CHILD is stored as reversed PARENT; cycles and cross-tree links are rejected."""
    serializer_class = RelationshipSerializer

    def get_queryset(self):
        return Relationship.objects.filter(tree=self.get_tree()).order_by("id")


class RelationshipDetailView(TreeScopedMixin, RetrieveDestroyAPIView):
    """GET: view one relationship. DELETE: remove it (owner only)."""
    serializer_class = RelationshipSerializer

    def get_queryset(self):
        return Relationship.objects.filter(tree=self.get_tree())


# ---------- Protected files (DB-7) ----------

def _serve(field_file, download_name=None):
    """Stream a private file. Callers must check access first."""
    if not field_file or not field_file.name:
        raise Http404("No file.")
    try:
        handle = field_file.open("rb")
    except FileNotFoundError:
        raise Http404("File is missing.")
    name = download_name or os.path.basename(field_file.name)
    response = FileResponse(handle, filename=name,
                            content_type=mimetypes.guess_type(name)[0] or "application/octet-stream")
    response["Cache-Control"] = "private, no-store"
    return response


class MemberPhotoView(TreeScopedMixin, APIView):
    """GET: the photo (Owner/Collaborator). PUT multipart 'photo': set it. DELETE: remove it."""
    parser_classes = [MultiPartParser, FormParser]

    def get_member(self):
        return get_object_or_404(FamilyMember, tree=self.get_tree(), pk=self.kwargs["pk"])

    def get(self, request, tree_id, pk):
        return _serve(self.get_member().photo)

    def put(self, request, tree_id, pk):
        member = self.get_member()
        ser = MemberPhotoSerializer(member, data=request.data)
        ser.is_valid(raise_exception=True)
        self._delete_after_commit(member.photo)
        member.photo = ser.validated_data["photo"]
        member.save()
        return Response(FamilyMemberSerializer(member).data)

    def delete(self, request, tree_id, pk):
        member = self.get_member()
        if member.photo:
            self._delete_after_commit(member.photo)
            member.photo = None
            member.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @staticmethod
    def _delete_after_commit(field_file):
        if field_file and field_file.name:
            storage, name = field_file.storage, field_file.name
            transaction.on_commit(lambda: storage.delete(name))


class DocumentListCreateView(TreeScopedMixin, ListCreateAPIView):
    """GET: a member's documents. POST multipart 'file': attach one (owner only; FR-6, FR-18)."""
    serializer_class = DocumentSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_member(self):
        return get_object_or_404(FamilyMember, tree=self.get_tree(), pk=self.kwargs["member_id"])

    def get_queryset(self):
        return Document.objects.filter(member=self.get_member()).select_related("member")

    def perform_create(self, serializer):
        serializer.save(member=self.get_member(), uploaded_by=self.request.user)


class DocumentDetailView(TreeScopedMixin, RetrieveDestroyAPIView):
    """GET: document info. DELETE: remove it and its file (owner only)."""
    serializer_class = DocumentSerializer

    def get_queryset(self):
        return Document.objects.filter(
            member__tree=self.get_tree(), member_id=self.kwargs["member_id"]
        ).select_related("member")


class DocumentFileView(TreeScopedMixin, APIView):
    """GET: download the document file (Owner/Collaborator only)."""

    def get(self, request, tree_id, member_id, pk):
        doc = get_object_or_404(Document, member__tree=self.get_tree(), member_id=member_id, pk=pk)
        return _serve(doc.file)


# ---------- Search (FR-15) ----------

class MemberSearchView(ListAPIView):
    """GET /api/search/?q=ann le[&tree=<id>]

    Every word must match a first or last name (partial, case-insensitive).
    Only trees the user owns or collaborates on are searched."""
    serializer_class = SearchResultSerializer
    pagination_class = None

    def get_queryset(self):
        words = self.request.query_params.get("q", "").split()
        if not words:
            raise ValidationError({"q": "Enter a name to search for."})
        trees = FamilyTree.objects.accessible_to(self.request.user)
        tree_param = self.request.query_params.get("tree")
        if tree_param:
            if not tree_param.isdigit():
                raise ValidationError({"tree": "Must be a tree id."})
            trees = trees.filter(pk=tree_param)
        qs = FamilyMember.objects.filter(tree__in=trees).select_related("tree")
        for word in words[:5]:
            qs = qs.filter(Q(first_name__icontains=word) | Q(last_name__icontains=word))
        return qs.order_by("last_name", "first_name", "id")[:SEARCH_LIMIT]


# ---------- Invitations (FR-10, FR-11, FR-19, SA-2) ----------

class InvitationListCreateView(TreeScopedMixin, ListCreateAPIView):
    """GET: this tree's links. POST: new link; the URL is shown only in this response."""
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated, IsTreeOwner]

    def get_queryset(self):
        return Invitation.objects.filter(tree=self.get_tree())

    def create(self, request, *args, **kwargs):
        invitation, raw = Invitation.create_for(self.get_tree(), request.user)
        data = InvitationSerializer(invitation).data
        data["url"] = invitation_url(raw)
        return Response(data, status=status.HTTP_201_CREATED)


class InvitationRevokeView(TreeScopedMixin, APIView):
    """DELETE: revoke a link (kept for history; people who joined stay)."""
    permission_classes = [IsAuthenticated, IsTreeOwner]

    def delete(self, request, tree_id, pk):
        invitation = get_object_or_404(Invitation, tree=self.get_tree(), pk=pk)
        if invitation.is_active:
            invitation.revoke()
        return Response(status=status.HTTP_204_NO_CONTENT)


INVALID_LINK = "This invitation link is invalid, expired, or revoked."


class InvitationAcceptView(APIView):
    """/api/invite/<token>/
    GET: preview (tree name) so the page can show "Join the Lee Family?".
    POST: join as Collaborator (FR-11). Invalid links get 404 + message (FR-19)."""

    def _invitation(self, token):
        invitation = Invitation.find_valid(token)
        if not invitation:
            raise Http404(INVALID_LINK)
        return invitation

    def get(self, request, token):
        inv = self._invitation(token)
        return Response({"tree_id": inv.tree_id, "tree_name": inv.tree.name,
                         "already_member": inv.tree.can_view(request.user)})

    def post(self, request, token):
        inv = self._invitation(token)
        tree = inv.tree
        if tree.is_owner(request.user):
            return Response({"tree_id": tree.pk, "role": "owner"})
        _, created = TreeCollaborator.objects.get_or_create(
            tree=tree, user=request.user, defaults={"invitation": inv}
        )
        return Response({"tree_id": tree.pk, "role": "collaborator"},
                        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class CollaboratorListView(TreeScopedMixin, ListAPIView):
    """GET: who has joined this tree (owner only)."""
    serializer_class = CollaboratorSerializer
    permission_classes = [IsAuthenticated, IsTreeOwner]

    def get_queryset(self):
        return TreeCollaborator.objects.filter(tree=self.get_tree()).select_related("user")


class CollaboratorRemoveView(TreeScopedMixin, APIView):
    """DELETE: remove a Collaborator's access (owner only)."""
    permission_classes = [IsAuthenticated, IsTreeOwner]

    def delete(self, request, tree_id, pk):
        get_object_or_404(TreeCollaborator, tree=self.get_tree(), pk=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ---------- Suggestions (FR-12 .. FR-14, FR-21, FR-22) ----------

class SuggestionQuerysetMixin(TreeScopedMixin):
    permission_classes = [IsAuthenticated, SuggestionPermission]

    def get_queryset(self):
        tree = self.get_tree()
        qs = SuggestRequest.objects.filter(tree=tree).select_related("target_member", "submitted_by")
        if not tree.is_owner(self.request.user):
            qs = qs.filter(submitted_by=self.request.user)  # Collaborators see their own
        return qs


class SuggestionListCreateView(SuggestionQuerysetMixin, ListCreateAPIView):
    """GET: Owner sees PENDING + OUTDATED by default (?status=ALL|APPROVED|...).
    POST: Collaborator submits (JSON, or multipart for ADD_MEDIA)."""
    serializer_class = SuggestionSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        qs = super().get_queryset()
        wanted = self.request.query_params.get("status", "OPEN").upper()
        if wanted == "OPEN":
            return qs.filter(status__in=[SuggestionStatus.PENDING, SuggestionStatus.OUTDATED])
        if wanted in SuggestionStatus.values:
            return qs.filter(status=wanted)
        return qs

    def perform_create(self, serializer):
        serializer.save(tree=self.get_tree(), submitted_by=self.request.user)


class SuggestionDetailView(SuggestionQuerysetMixin, RetrieveAPIView):
    """GET: one suggestion, with current vs proposed values (FR-21)."""
    serializer_class = SuggestionSerializer


class SuggestionFileView(SuggestionQuerysetMixin, APIView):
    """GET: preview an ADD_MEDIA file before approving."""

    def get(self, request, tree_id, pk):
        return _serve(get_object_or_404(self.get_queryset(), pk=pk).proposed_file)


class _ReviewView(SuggestionQuerysetMixin, APIView):
    owner_action = True

    def review(self, pk):
        raise NotImplementedError

    def post(self, request, tree_id, pk):
        suggestion = get_object_or_404(self.get_queryset(), pk=pk)
        try:
            suggestion = self.review(suggestion.pk)
        except OutdatedSuggestion as exc:
            mark_outdated(suggestion.pk)
            suggestion.refresh_from_db()
            return Response(
                {"detail": exc.messages[0], "code": "outdated",
                 "suggestion": SuggestionSerializer(suggestion).data},
                status=status.HTTP_409_CONFLICT,
            )
        except DjangoPermissionDenied as exc:
            raise PermissionDenied(str(exc))
        except DjangoValidationError as exc:
            raise ValidationError(exc.message_dict if hasattr(exc, "error_dict") else exc.messages)
        return Response(SuggestionSerializer(suggestion).data)


class SuggestionApproveView(_ReviewView):
    """POST {"confirm_outdated": true?}: apply the change (FR-14).
    409 + side-by-side values if the member changed since (FR-21)."""

    def review(self, pk):
        confirm = str(self.request.data.get("confirm_outdated", "")).lower() in ("true", "1")
        return approve_suggestion(pk, self.request.user, confirm_outdated=confirm)


class SuggestionRejectView(_ReviewView):
    """POST: discard the suggestion without changing the tree (FR-14)."""

    def review(self, pk):
        return reject_suggestion(pk, self.request.user)