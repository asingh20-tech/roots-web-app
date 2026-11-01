from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated

from .models import FamilyMember, FamilyTree, Relationship
from .serializers import FamilyMemberSerializer, FamilyTreeSerializer, RelationshipSerializer


class FamilyTreeListCreateView(ListCreateAPIView):
    """List trees the user can access, or create a new tree (FR-3, DB-4)."""
    serializer_class = FamilyTreeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return trees the logged-in user owns or collaborates on."""
        return FamilyTree.objects.accessible_to(self.request.user)

    def perform_create(self, serializer):
        """The logged-in user becomes the Tree Owner."""
        serializer.save(owner=self.request.user)


class FamilyTreeDetailView(RetrieveAPIView):
    """Retrieve one tree the user can access (404 otherwise)."""
    serializer_class = FamilyTreeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FamilyTree.objects.accessible_to(self.request.user)


class TreeScopedListView(ListAPIView):
    """Base view: resolve tree_id from the URL, but only if the user can access it."""
    permission_classes = [IsAuthenticated]

    def get_tree(self):
        return get_object_or_404(
            FamilyTree.objects.accessible_to(self.request.user),
            pk=self.kwargs["tree_id"],
        )


class FamilyMemberListView(TreeScopedListView):
    """List members of an accessible tree."""
    serializer_class = FamilyMemberSerializer

    def get_queryset(self):
        return FamilyMember.objects.filter(tree=self.get_tree()).order_by("last_name", "first_name")


class RelationshipListView(TreeScopedListView):
    """List relationships of an accessible tree."""
    serializer_class = RelationshipSerializer

    def get_queryset(self):
        return Relationship.objects.filter(tree=self.get_tree()).order_by("id")
