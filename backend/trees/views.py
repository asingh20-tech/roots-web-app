from rest_framework.generics import ListCreateAPIView
from .serializers import FamilyTreeSerializer
from .models import FamilyTree

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