
from django.shortcuts import get_object_or_404
from rest_framework.generics import (
    ListCreateAPIView,
    ListAPIView,
    RetrieveAPIView,
)
from rest_framework.permissions import IsAuthenticated

from .models import FamilyTree, FamilyMember, Relationship
from .serializers import (
    FamilyTreeSerializer,
    FamilyMemberSerializer,
    RelationshipSerializer,
)


class FamilyTreeListCreateView(ListCreateAPIView):
    """API view to list and create FamilyTree instances."""

    serializer_class = FamilyTreeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return trees accessible to the logged-in user."""
        user = self.request.user
        return FamilyTree.objects.accessible_to(user)

    def perform_create(self, serializer):
        """Assign ownership to the logged-in user."""
        serializer.save(owner=self.request.user)


class FamilyTreeDetailView(RetrieveAPIView):
    """Retrieve one family tree accessible to the logged-in user."""

    serializer_class = FamilyTreeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return trees accessible to the logged-in user."""
        user = self.request.user
        return FamilyTree.objects.accessible_to(user)


class FamilyMemberListView(ListAPIView):
    """List family members belonging to an accessible tree."""

    serializer_class = FamilyMemberSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return members of the requested accessible tree."""
        user = self.request.user

        tree = get_object_or_404(
            FamilyTree.objects.accessible_to(user),
            id=self.kwargs["tree_id"],
        )

        return FamilyMember.objects.filter(tree=tree)


class RelationshipListView(ListAPIView):
    """List relationships belonging to an accessible tree."""

    serializer_class = RelationshipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return relationships of the requested accessible tree."""
        user = self.request.user

        tree = get_object_or_404(
            FamilyTree.objects.accessible_to(user),
            id=self.kwargs["tree_id"],
        )

        return Relationship.objects.filter(tree=tree)
