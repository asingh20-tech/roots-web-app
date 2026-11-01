
from rest_framework import serializers
from .models import FamilyTree, FamilyMember, Relationship


class FamilyTreeSerializer(serializers.ModelSerializer):
    """Serializer for the FamilyTree model."""

    class Meta:
        model = FamilyTree
        fields = [
            'id',
            'name',
            'description',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class FamilyMemberSerializer(serializers.ModelSerializer):
    """Serializer for the FamilyMember model."""

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = FamilyMember
        fields = [
            'id',
            'first_name',
            'last_name',
            'full_name',
            'gender',
            'birth_date',
            'death_date',
            'photo',
        ]
        read_only_fields = ['id', 'full_name']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class RelationshipSerializer(serializers.ModelSerializer):
    """Serializer for the Relationship model."""

    class Meta:
        model = Relationship
        fields = [
            'id',
            'member1',
            'member2',
            'relationship_type',
            'start_date',
        ]
        read_only_fields = ['id']
