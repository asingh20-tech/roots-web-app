from rest_framework.generics import ListCreateAPIView, ListAPIView
from rest_framework.generics import RetrieveAPIView
from .serializers import FamilyTreeSerializer
from .models import FamilyTree
from .models import FamilyMember
from .serializers import FamilyMemberSerializer
from django.shortcuts import get_object_or_404
from .models import Relationship
from .serializers import RelationshipSerializer

class FamilyTreeListCreateView(ListCreateAPIView):
    """API view to list and create FamilyTree instances."""
    serializer_class = FamilyTreeSerializer

    def get_queryset(self):
        """Override to filter the queryset based on the logged-in user."""
        user = self.request.user
        return FamilyTree.objects.accessible_to(user)

    
    def perform_create(self, serializer):
        """Override to associate the new FamilyTree instance with the logged-in user."""
        serializer.save(owner=self.request.user)

class FamilyTreeDetailView(RetrieveAPIView):
    """API view to retrieve one family tree accessible to the logged-in user."""
    serializer_class = FamilyTreeSerializer

    def get_queryset(self):
        """Override to filter the queryset based on the logged-in user."""
        user = self.request.user
        return FamilyTree.objects.accessible_to(user)

class FamilyMemberListView(ListAPIView):
    """API View to list family members."""
    serializer_class = FamilyMemberSerializer

    def get_queryset(self):
        """Override to filter the queryset based on the logged-in user."""
        user = self.request.user

        tree = get_object_or_404(FamilyTree.objects.accessible_to(user), id=self.kwargs['tree_id'])
        return FamilyMember.objects.filter(tree=tree)

class RelationshipListView(ListAPIView):
    """API View to list relationships for the entire family tree."""
    serializer_class = RelationshipSerializer

    def get_queryset(self):
        """Override to filter the queryset based on the logged-in user."""
        user = self.request.user
        tree = get_object_or_404(FamilyTree.objects.accessible_to(user), id=self.kwargs['tree_id'])
        return Relationship.objects.filter(tree=tree)