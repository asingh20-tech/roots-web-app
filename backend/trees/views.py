from django.shortcuts import get_object_or_404
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    RetrieveDestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated

from .models import FamilyMember, FamilyTree, Relationship
from .permissions import IsTreeOwnerOrReadOnly
from .serializers import FamilyMemberSerializer, FamilyTreeSerializer, RelationshipSerializer


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