from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.urls import reverse
from rest_framework import serializers

from .models import (
    ChangeType,
    Document,
    FamilyMember,
    FamilyTree,
    Invitation,
    Relationship,
    RelationshipType,
    SuggestRequest,
    TreeCollaborator,
)
from .services import EDITABLE_MEMBER_FIELDS, compare

def _django_errors(exc):
    return exc.message_dict if hasattr(exc, "error_dict") else {"non_field_errors": exc.messages}



class ModelCleanMixin:
    """Run the model's full_clean() on save so model rules return a 400 error
    (with a message) instead of a 500 crash (FR-16, FR-17, DB-2, DB-3).

    DRF does not call Model.clean() on its own."""

    def _clean_and_save(self, instance, attrs):
        for field, value in attrs.items():
            setattr(instance, field, value)
        try:
            instance.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError( exc.message_dict if hasattr(exc, "error_dict") else {"non_field_errors": exc.messages})
        instance.save()
        return instance

    def create(self, validated_data):
        return self._clean_and_save(self.Meta.model(), validated_data)

    def update(self, instance, validated_data):
        return self._clean_and_save(instance, validated_data)


class FamilyTreeSerializer(ModelCleanMixin, serializers.ModelSerializer):
    """FamilyTree as JSON. 'owner' is omitted so clients can't set it (FR-3)."""
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = FamilyTree
        fields = ["id", "name", "description", "created_at", "is_owner"]
        read_only_fields = ["id", "created_at", "is_owner"]

    def get_is_owner(self, obj):
        # Lets the frontend show/hide owner controls (Section 1.3.3).
        request = self.context.get("request")
        return bool(request and obj.owner_id == request.user.pk)


class FamilyMemberSerializer(ModelCleanMixin, serializers.ModelSerializer):
    """FamilyMember as JSON (FR-4, IR-2). Tree comes from the URL, not the body.
    Photo is read-only here; uploads get their own endpoint (FR-6)."""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = FamilyMember
        fields = ["id", "first_name", "last_name", "full_name", "gender",
                  "birth_date", "death_date", "photo", "version", "updated_at"]
        read_only_fields = ["id", "full_name", "photo", "version", "updated_at"]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class RelationshipSerializer(ModelCleanMixin, serializers.ModelSerializer):
    """Relationship as JSON (FR-5, IR-3).

    Accepts CHILD on input and stores it as the reversed PARENT row.
    Both members must belong to the tree in the URL (DB-2)."""
    relationship_type = serializers.ChoiceField(
        choices=list(RelationshipType.values) + ["CHILD"]
    )

    class Meta:
        model = Relationship
        fields = ["id", "member1", "member2", "relationship_type", "start_date", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        tree = self.context["tree"]
        m1, m2 = attrs["member1"], attrs["member2"]
        if m1.tree_id != tree.pk or m2.tree_id != tree.pk:
            raise serializers.ValidationError("Both members must belong to this family tree.")
        attrs["member1"], attrs["member2"], attrs["relationship_type"] = Relationship.normalize(m1, m2, attrs["relationship_type"])
        attrs["tree"] = tree
        return attrs