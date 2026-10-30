from rest_framework import serializers
from .models import FamilyTree


class FamilyTreeSerializer(serializers.ModelSerializer):
    """Serializer for the FamilyTree model."""
    "Shows the fields of the FamilyTree model and makes 'id' and 'created_at' read-only."
    class Meta:
        model = FamilyTree
        fields = ['id', 'name', 'description', 'created_at',]
        read_only_fields = ['id', 'created_at']



