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
        return FamilyTree.objects.accessible_to(self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class FamilyTreeDetailView(RetrieveUpdateDestroyAPIView):
    """GET: owner or collaborator. PATCH/PUT/DELETE: owner only (SA-1).
    DELETE cascades to members, relationships, suggestions, documents,
    invitations, and collaborators (DB-6)."""
    serializer_class = FamilyTreeSerializer
    permission_classes = [IsAuthenticated, IsTreeOwnerOrReadOnly]

    def get_queryset(self):
        return FamilyTree.objects.accessible_to(self.request.user)


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
    """GET: view a member (FR-9). PATCH/PUT: edit. DELETE: remove (owner only).
    Deleting a member also deletes their relationships."""
    serializer_class = FamilyMemberSerializer

    def get_queryset(self):
        return FamilyMember.objects.filter(tree=self.get_tree())


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