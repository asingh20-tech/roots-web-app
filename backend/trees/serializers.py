import os

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
from .services import EDITABLE_MEMBER_FIELDS, compare, member_snapshot


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
            raise serializers.ValidationError(_django_errors(exc))
        instance.save()
        return instance

    def create(self, validated_data):
        return self._clean_and_save(self.Meta.model(), validated_data)

    def update(self, instance, validated_data):
        return self._clean_and_save(instance, validated_data)


class FamilyTreeSerializer(ModelCleanMixin, serializers.ModelSerializer):
    """FamilyTree as JSON. 'owner' is omitted so clients can't set it (FR-3)."""
    is_owner = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = FamilyTree
        fields = ["id", "name", "description", "created_at", "is_owner", "member_count"]
        read_only_fields = ["id", "created_at", "is_owner", "member_count"]

    def get_is_owner(self, obj):
        # Lets the frontend show/hide owner controls (Section 1.3.3).
        request = self.context.get("request")
        return bool(request and obj.owner_id == request.user.pk)

    def get_member_count(self, obj):
        # Saved members only (pending ADD_MEMBER suggestions are not counted).
        # List/detail views annotate it in one query (with_member_count);
        # a freshly created tree falls back to a count.
        annotated = getattr(obj, "member_count", None)
        return annotated if annotated is not None else obj.members.count()


class FamilyMemberSerializer(ModelCleanMixin, serializers.ModelSerializer):
    """FamilyMember as JSON (FR-4, IR-2). Tree comes from the URL, not the body.
    Photo is uploaded at .../members/<id>/photo/. photo_url points to the
    protected view, never the raw storage path (DB-7)."""
    full_name = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()
    # FR-25 (proposed): read-only provenance. Set by approve_suggestion() only.
    contributed_by = serializers.PrimaryKeyRelatedField(read_only=True)
    contributed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = FamilyMember
        fields = ["id", "first_name", "last_name", "full_name", "gender",
                  "birth_date", "death_date", "photo_url", "version", "updated_at",
                  "contributed_by", "contributed_by_name"]
        read_only_fields = ["id", "full_name", "photo_url", "version", "updated_at",
                            "contributed_by", "contributed_by_name"]

    def get_contributed_by_name(self, obj):
        user = obj.contributed_by
        return (user.get_full_name() or user.email) if user else None

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

    def get_photo_url(self, obj):
        if not obj.photo:
            return None
        return reverse("member-photo", args=[obj.tree_id, obj.pk])


class DocumentSerializer(serializers.ModelSerializer):
    """Upload: multipart field 'file' (FR-6, FR-18, IR-4). Model validators
    reject wrong types, fake extensions and files over 10 MB with a message."""
    url = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = ["id", "file", "name", "url", "file_type", "file_size", "uploaded_at"]
        read_only_fields = ["id", "name", "url", "file_type", "file_size", "uploaded_at"]
        extra_kwargs = {"file": {"write_only": True}}

    def get_url(self, obj):
        return reverse("document-file", args=[obj.member.tree_id, obj.member_id, obj.pk])

    def get_name(self, obj):
        return str(obj)


class FamilyMemberDetailSerializer(FamilyMemberSerializer):
    """FR-9: profile = member details + attached documents."""
    documents = DocumentSerializer(many=True, read_only=True)

    class Meta(FamilyMemberSerializer.Meta):
        fields = FamilyMemberSerializer.Meta.fields + ["documents"]
        read_only_fields = FamilyMemberSerializer.Meta.read_only_fields + ["documents"]


class MemberPhotoSerializer(serializers.ModelSerializer):
    """PUT multipart field 'photo' (JPG/PNG, 10 MB)."""

    class Meta:
        model = FamilyMember
        fields = ["photo"]
        extra_kwargs = {"photo": {"required": True, "allow_null": False}}


class SearchResultSerializer(FamilyMemberSerializer):
    """FR-15: a member plus which tree it came from."""
    tree_id = serializers.IntegerField(read_only=True)
    tree_name = serializers.CharField(source="tree.name", read_only=True)

    class Meta(FamilyMemberSerializer.Meta):
        fields = ["id", "tree_id", "tree_name", "first_name", "last_name", "full_name",
                  "birth_date", "death_date", "photo_url"]


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


# ---------- Collaboration (FR-10 .. FR-14, FR-21) ----------

class InvitationSerializer(serializers.ModelSerializer):
    """Only a hash is stored (SA-2), so 'url' is returned once, on create."""
    is_valid = serializers.BooleanField(read_only=True)
    collaborator_count = serializers.SerializerMethodField()

    class Meta:
        model = Invitation
        fields = ["id", "is_active", "is_valid", "created_at", "expires_at", "revoked_at",
                  "collaborator_count"]
        read_only_fields = fields

    def get_collaborator_count(self, obj):
        return obj.collaborators.count()


class CollaboratorSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    name = serializers.SerializerMethodField()

    class Meta:
        model = TreeCollaborator
        fields = ["id", "user", "email", "name", "joined_at"]
        read_only_fields = fields

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.email


class SuggestionSerializer(serializers.ModelSerializer):
    """FR-12 submit (Collaborator) / FR-13 list (Owner).

    ADD_MEMBER:    proposed_data = {first_name, last_name, ...}, no target.
    UPDATE_MEMBER: target_member + proposed_data with only the changed fields.
    ADD_MEDIA:     target_member + proposed_file (multipart).
    Data is validated now, so a bad suggestion fails at submit, not at approval.
    """
    submitted_by_name = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()
    target_member_name = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    is_outdated = serializers.SerializerMethodField()
    comparison = serializers.SerializerMethodField()

    class Meta:
        model = SuggestRequest
        fields = ["id", "change_type", "description", "target_member", "target_member_name",
                  "proposed_data", "proposed_file", "file_url", "file_name", "status",
                  "is_outdated", "comparison", "original_data", "based_on_version",
                  "submitted_by", "submitted_by_name", "is_mine", "reviewed_by_name",
                  "created_at", "reviewed_at", "edited_at", "withdrawn_at"]
        # submitted_by / status / review fields come from the server only, so a
        # client can't impersonate another author or fake a review (FR-24).
        read_only_fields = ["id", "target_member_name", "file_url", "file_name", "status",
                            "is_outdated", "comparison", "original_data", "submitted_by",
                            "submitted_by_name", "is_mine", "reviewed_by_name", "created_at",
                            "reviewed_at", "edited_at", "withdrawn_at"]
        extra_kwargs = {
            "proposed_file": {"write_only": True},
            # UPDATE_MEMBER: the member version the form was filled from (FR-21).
            "based_on_version": {"required": False, "allow_null": True},
        }

    # ----- output -----
    def get_submitted_by_name(self, obj):
        return obj.submitted_by.get_full_name() or obj.submitted_by.email

    def get_is_mine(self, obj):
        request = self.context.get("request")
        return bool(request and obj.submitted_by_id == request.user.pk)

    def get_reviewed_by_name(self, obj):
        user = obj.reviewed_by
        return (user.get_full_name() or user.email) if user else None

    def get_file_name(self, obj):
        return os.path.basename(obj.proposed_file.name) if obj.proposed_file else None

    def get_target_member_name(self, obj):
        return str(obj.target_member) if obj.target_member_id else None

    def get_file_url(self, obj):
        if not obj.proposed_file:
            return None
        return reverse("suggestion-file", args=[obj.tree_id, obj.pk])

    def get_is_outdated(self, obj):
        return bool(
            obj.target_member_id
            and obj.status in ("PENDING", "OUTDATED")
            and obj.based_on_version is not None
            and obj.target_member.version != obj.based_on_version
        )

    def get_comparison(self, obj):
        return compare(obj)

    # ----- input -----
    def validate(self, attrs):
        tree = self.context["tree"]
        if self.instance is not None:
            return self._validate_edit(attrs)
        kind = attrs["change_type"]
        target = attrs.get("target_member")
        data = attrs.get("proposed_data") or {}
        #relationship validation logic

        if kind == ChangeType.ADD_RELATIONSHIP:
            if target:
                raise serializers.ValidationError({
                    "target_member": "ADD_RELATIONSHIP stores both members in proposed_data."
                })
            if attrs.get("proposed_file"):
                raise serializers.ValidationError({
                    "proposed_file": "Only ADD_MEDIA takes a file."
                })
            if not isinstance(data, dict) or not data:
                raise serializers.ValidationError({
                    "proposed_data": "Give the relationship fields to add."
                })

            relationship_ser = RelationshipSerializer(
                data=data,
                context={"tree": tree},
            )
            if not relationship_ser.is_valid():
                raise serializers.ValidationError({
                    "proposed_data": relationship_ser.errors
                })

            clean = relationship_ser.validated_data
            preview = Relationship(**clean)
            try:
                preview.full_clean()
            except DjangoValidationError as exc:
                raise serializers.ValidationError({
                    "proposed_data": _django_errors(exc)
                })

            attrs["proposed_data"] = {
                "member1": clean["member1"].pk,
                "member2": clean["member2"].pk,
                "relationship_type": clean["relationship_type"],
                "start_date": (
                    clean["start_date"].isoformat()
                    if clean.get("start_date")
                    else None
                ),
            }
            return attrs

        if target and target.tree_id != tree.pk:  # DB-2
            raise serializers.ValidationError({"target_member": "Member is not in this tree."})
        if kind not in {ChangeType.ADD_MEMBER, ChangeType.ADD_RELATIONSHIP} and not target:
            raise serializers.ValidationError({"target_member": "This change type needs a target member."})
        if kind == ChangeType.ADD_MEMBER and target:
            raise serializers.ValidationError({"target_member": "ADD_MEMBER must not have a target."})

        if kind == ChangeType.ADD_MEDIA:
            if not attrs.get("proposed_file"):
                raise serializers.ValidationError({"proposed_file": "ADD_MEDIA needs a file."})
            attrs["proposed_data"] = None
            attrs["based_on_version"] = None
            return attrs

        if kind == ChangeType.UPDATE_MEMBER:
            # FR-21: refuse an edit made from a stale form instead of storing a
            # suggestion that is outdated from the start.
            seen = attrs.get("based_on_version")
            if seen is not None and seen != target.version:
                raise serializers.ValidationError({
                    "based_on_version": f"{target} was changed since you opened this form. "
                                        "Reload to see the current details."
                })
            attrs["based_on_version"] = target.version
        else:
            attrs["based_on_version"] = None

        if attrs.get("proposed_file"):
            raise serializers.ValidationError({"proposed_file": "Only ADD_MEDIA takes a file."})
        if not isinstance(data, dict) or not data:
            raise serializers.ValidationError({"proposed_data": "Give the member fields to add or change."})
        unknown = set(data) - EDITABLE_MEMBER_FIELDS
        if unknown:
            raise serializers.ValidationError({"proposed_data": f"Unknown fields: {', '.join(sorted(unknown))}"})

        # Validate the values as the member would be after approval.
        member_ser = FamilyMemberSerializer(
            instance=target, data=data, partial=kind == ChangeType.UPDATE_MEMBER
        )
        if not member_ser.is_valid():
            raise serializers.ValidationError({"proposed_data": member_ser.errors})
        clean = {k: v for k, v in member_ser.validated_data.items() if k in data}
        preview = FamilyMember(tree=tree)
        if target:
            for field in EDITABLE_MEMBER_FIELDS:
                setattr(preview, field, getattr(target, field))
        for field, value in clean.items():
            setattr(preview, field, value)
        try:
            preview.clean()  # FR-16: death before birth
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"proposed_data": _django_errors(exc)})

        attrs["proposed_data"] = {
            k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in clean.items()
        }
        if kind == ChangeType.UPDATE_MEMBER:
            unchanged = [k for k, v in attrs["proposed_data"].items()
                         if member_snapshot(target, [k]).get(k) == v]
            if len(unchanged) == len(attrs["proposed_data"]):
                raise serializers.ValidationError({"proposed_data": "Change at least one detail."})
            attrs["original_data"] = member_snapshot(target, attrs["proposed_data"].keys())
        return attrs

    def _validate_edit(self, attrs):
        """FR-24: the author edits their own PENDING suggestion. The type and
        target are fixed; the new values are validated exactly like a new
        submission of the same type."""
        instance = self.instance
        if "change_type" in attrs and attrs["change_type"] != instance.change_type:
            raise serializers.ValidationError({"change_type": "The type of a suggestion can't be changed."})
        if "target_member" in attrs and attrs["target_member"] != instance.target_member:
            raise serializers.ValidationError({"target_member": "The person a suggestion is about can't be changed."})
        if "proposed_data" not in attrs and "proposed_file" not in attrs:
            return attrs  # only the notes changed
        fresh = SuggestionSerializer(context=self.context)
        merged = {
            "change_type": instance.change_type,
            "target_member": instance.target_member,
            "description": attrs.get("description", instance.description),
            "proposed_data": attrs.get("proposed_data", instance.proposed_data),
            "based_on_version": attrs.get("based_on_version"),
        }
        if instance.change_type == ChangeType.ADD_MEDIA:
            merged["proposed_file"] = attrs.get("proposed_file") or instance.proposed_file
        validated = fresh.validate(merged)
        validated.pop("change_type")
        validated.pop("target_member")
        if instance.change_type == ChangeType.ADD_MEDIA and "proposed_file" not in attrs:
            validated.pop("proposed_file", None)
        return validated

    def update(self, instance, validated_data):
        from django.utils import timezone

        old_file = instance.proposed_file if "proposed_file" in validated_data else None
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.edited_at = timezone.now()
        try:
            instance.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(_django_errors(exc))
        instance.save()
        if old_file and old_file.name and old_file.name != instance.proposed_file.name:
            from django.db import transaction

            storage, name = old_file.storage, old_file.name
            transaction.on_commit(lambda: storage.delete(name))
        return instance

    def create(self, validated_data):
        instance = SuggestRequest(**validated_data)
        try:
            instance.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(_django_errors(exc))
        instance.save()
        return instance


def invitation_url(raw_token):
    return f"{settings.FRONTEND_URL}/invite/{raw_token}"
