"""Roots database schema — matches docs/er-diagram (ER Diagram.pdf) and SRS 3.5.

Tables: family_tree, tree_collaborator, invitation, family_member,
relationship, document, suggest_request.  (users lives in accounts.models.)

Same-tree composite foreign keys are added in migration 0002 (PostgreSQL).

Note: model clean() rules are NOT run by save() or by DRF serializers
automatically. Call instance.full_clean() before saving (or in the
serializer's validate()) so FR-16/FR-17 and DB-2 are enforced.
"""


import hashlib
import os
import secrets
import uuid
from datetime import timedelta

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.db import models
from django.db.models import F, Q
from django.utils import timezone

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # IN SRS FR-6 / FR-18: 10 MiB
DOCUMENT_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"]
PHOTO_EXTENSIONS = ["jpg", "jpeg", "png"]
INVITATION_LIFETIME = timedelta(days=7)


def validate_upload_size(file):
    if file.size > MAX_UPLOAD_BYTES:
        raise ValidationError("File is larger than 10 MB.")


def private_upload_path(instance, filename):
    """Store uploads under MEDIA_ROOT/trees/<tree_id>/ with a random name.

    MEDIA_ROOT must be outside the public web root (DB-7); files are served
    by an authenticated view, never directly.
    """
    tree_id = getattr(instance, "tree_id", None) or instance.member.tree_id
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "bin"
    return f"trees/{tree_id}/{uuid.uuid4().hex}.{ext}"


# --------------------------------------------------------------------------
# family_tree / invitation / tree_collaborator
# --------------------------------------------------------------------------

class FamilyTreeQuerySet(models.QuerySet):
    def accessible_to(self, user):
        """Trees the user owns or collaborates on (DB-4, FR-15)."""
        return self.filter(Q(owner=user) | Q(collaborators__user=user)).distinct()


class FamilyTree(models.Model):
    # DB-2: exactly one owner. DB-6: deleting a tree cascades to all its rows.
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="owned_trees" 
    )
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = FamilyTreeQuerySet.as_manager()

    class Meta:
        db_table = "family_tree"
        ordering = ["name"]

    def __str__(self):
        return self.name

    def is_owner(self, user):
        return user.is_authenticated and self.owner_id == user.pk

    def can_view(self, user):
        return self.is_owner(user) or (
            user.is_authenticated and self.collaborators.filter(user=user).exists()
        )


class Invitation(models.Model):
    """Reusable, revocable invitation link (FR-10, FR-11, FR-19, SA-2).

    Only a SHA-256 hash of the token is stored. The raw token is returned
    once by create_for() and placed in the URL. Links expire after 7 days.
    """

    tree = models.ForeignKey(FamilyTree, on_delete=models.CASCADE, related_name="invitations")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column="created_by",
        related_name="invitations_created",
    )
    token_hash = models.CharField(max_length=64, unique=True, editable=False)#This is useful because if someone gains read access to your invitation database, they don't immediately get usable invitation tokens.
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "invitation"
        ordering = ["-created_at"]
        constraints = [
            # Target for the composite FK tree_collaborator(invitation_id, tree_id).
            models.UniqueConstraint(fields=["id", "tree"], name="invitation_id_tree_uniq"),
        ]

    def __str__(self):
        return f"Invitation to {self.tree} ({'valid' if self.is_valid else 'invalid'})"

    @staticmethod
    def hash_token(raw_token):
        return hashlib.sha256(raw_token.encode()).hexdigest()

    @classmethod
    def create_for(cls, tree, created_by, expires_in=INVITATION_LIFETIME):
        raw = secrets.token_urlsafe(32)  # 43 chars, 256 bits (SA-2: >= 32 chars)
        invitation = cls.objects.create(
            tree=tree,
            created_by=created_by,
            token_hash=cls.hash_token(raw),
            expires_at=timezone.now() + expires_in,
        )
        return invitation, raw

    @classmethod
    def find_valid(cls, raw_token):
        """Return the matching valid Invitation, or None (FR-19)."""
        inv = cls.objects.filter(token_hash=cls.hash_token(raw_token)).select_related("tree").first()
        return inv if inv and inv.is_valid else None

    @property
    def is_valid(self):
        if not self.is_active or self.revoked_at:
            return False
        return self.expires_at is None or self.expires_at > timezone.now()

    def revoke(self):
        self.is_active = False
        self.revoked_at = timezone.now()
        self.save(update_fields=["is_active", "revoked_at"])


class TreeCollaborator(models.Model):
    """A user who joined a tree through an invitation link (FR-11)."""

    tree = models.ForeignKey(FamilyTree, on_delete=models.CASCADE, related_name="collaborators")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="collaborations"
    )
    # Links are revoked, not deleted; RESTRICT still allows the tree cascade.
    invitation = models.ForeignKey(
        Invitation, on_delete=models.RESTRICT, related_name="collaborators"
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "tree_collaborator"
        constraints = [
            models.UniqueConstraint(fields=["tree", "user"], name="unique_collaborator_per_tree"),
        ]

    def __str__(self):
        return f"{self.user} -> {self.tree}"

    def clean(self):
        if self.tree_id and self.user_id and self.tree.owner_id == self.user_id:
            raise ValidationError("The Tree Owner cannot also be a Collaborator.")
        if self.invitation_id and self.invitation.tree_id != self.tree_id:  # DB-2
            raise ValidationError("Invitation belongs to a different tree.")


# --------------------------------------------------------------------------
# family_member / relationship / document
# --------------------------------------------------------------------------

class Gender(models.TextChoices):
    FEMALE = "FEMALE", "Female"
    MALE = "MALE", "Male"
    OTHER = "OTHER", "Other"
    UNKNOWN = "UNKNOWN", "Unknown / prefer not to say"


class FamilyMember(models.Model):
    """A person shown as a node in a tree. Not necessarily a User (FR-4, IR-2)."""

    tree = models.ForeignKey(FamilyTree, on_delete=models.CASCADE, related_name="members")
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    gender = models.CharField(max_length=20, choices=Gender.choices, default=Gender.UNKNOWN)
    birth_date = models.DateField(null=True, blank=True)
    death_date = models.DateField(null=True, blank=True)
    photo = models.ImageField(
        upload_to=private_upload_path,
        max_length=255,
        null=True,
        blank=True,
        validators=[FileExtensionValidator(PHOTO_EXTENSIONS), validate_upload_size],
    )
    # FR-21: bumped on every save; suggestions record the version they saw.
    version = models.PositiveIntegerField(default=1, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "family_member"
        ordering = ["last_name", "first_name"]
        constraints = [
            # DB-3 / FR-16, enforced by PostgreSQL as well as in clean().
            models.CheckConstraint(
                condition=Q(birth_date__isnull=True)
                | Q(death_date__isnull=True)
                | Q(death_date__gte=F("birth_date")),
                name="member_death_not_before_birth",
            ),
            # Target for the composite FKs from relationship / suggest_request.
            models.UniqueConstraint(fields=["id", "tree"], name="family_member_id_tree_uniq"),
        ]
        indexes = [  # FR-15 search within a tree
            models.Index(fields=["tree", "last_name"]),
            models.Index(fields=["tree", "first_name"]),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def clean(self):
        if self.birth_date and self.death_date and self.death_date < self.birth_date:
            raise ValidationError({"death_date": "Death date cannot be before birth date."})

#I have to check --> this version increment happens when this instance's save() runs, not necessarily on every kind of database update. Operations like QuerySet.update() bypass this method. 
# Also, using save(update_fields=...) can leave the incremented version unsaved unless version is included.

    def save(self, *args, **kwargs):
        adding = self._state.adding
        if not adding:
            self.version += 1
        super().save(*args, **kwargs)
        if not adding:
            # FR-21: pending suggestions based on an older version are now outdated.
            self.suggestions.filter(status=SuggestionStatus.PENDING).exclude(
                based_on_version=self.version
            ).update(status=SuggestionStatus.OUTDATED)


class RelationshipType(models.TextChoices):
    """CHILD is never stored: 'A is child of B' is saved as 'B is PARENT of A' (FR-5)."""

    PARENT = "PARENT", "Parent"
    ADOPTIVE_PARENT = "ADOPTIVE_PARENT", "Adoptive parent"
    SPOUSE = "SPOUSE", "Spouse"
    SIBLING = "SIBLING", "Sibling"


PARENT_TYPES = [RelationshipType.PARENT, RelationshipType.ADOPTIVE_PARENT]
SYMMETRIC_TYPES = [RelationshipType.SPOUSE, RelationshipType.SIBLING]


class Relationship(models.Model):
    """A link between two members of the same tree (FR-5, IR-3, DB-2).

    PARENT / ADOPTIVE_PARENT: member1 is the parent of member2.
    SPOUSE / SIBLING: stored with member1_id < member2_id so a pair can't be
    saved twice. start_date is the marriage date (SPOUSE only).
    """

    member1 = models.ForeignKey(
        FamilyMember, on_delete=models.CASCADE, related_name="relationships_as_member1"
    )
    member2 = models.ForeignKey(
        FamilyMember, on_delete=models.CASCADE, related_name="relationships_as_member2"
    )
    tree = models.ForeignKey(FamilyTree, on_delete=models.CASCADE, related_name="relationships")
    relationship_type = models.CharField(max_length=20, choices=RelationshipType.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    start_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "relationship"
        constraints = [
            models.CheckConstraint(
                condition=~Q(member1=F("member2")), name="relationship_not_self"
            ),
            #Only declared relationship types can be stored
            models.CheckConstraint(
                condition=Q(relationship_type__in=RelationshipType.values),
                name="relationship_type_valid",
            ),
            #Marriage date is only allowed for spouse relationships
            models.CheckConstraint(
                condition=Q(start_date__isnull=True) | Q(relationship_type=RelationshipType.SPOUSE),
                name="start_date_only_for_spouse",
            ),
            #Prevents identical member-pair/type combinations
            models.UniqueConstraint(
                fields=["member1", "member2", "relationship_type"],
                name="unique_relationship",
            ),
            # Prevents duplicate biological/adoptive parent links for the same ordered pair
            models.UniqueConstraint(
                fields=["member1", "member2"],
                condition=Q(relationship_type__in=PARENT_TYPES),
                name="unique_parent_link",
            ),
        ]

    def __str__(self):
        return f"{self.member1} {self.get_relationship_type_display()} {self.member2}"

    @staticmethod
    def normalize(member_a, member_b, rel_type):
        """Turn API input (incl. 'CHILD') into stored (member1, member2, type)."""
        if rel_type == "CHILD":  # "A is child of B" -> "B is parent of A"
            return member_b, member_a, RelationshipType.PARENT
        if rel_type in SYMMETRIC_TYPES and member_b.pk < member_a.pk:
            return member_b, member_a, rel_type
        return member_a, member_b, rel_type

    def save(self, *args, **kwargs):
        if self.relationship_type in SYMMETRIC_TYPES and self.member2_id < self.member1_id:
            self.member1, self.member2 = self.member2, self.member1
        if not self.tree_id and self.member1_id:
            self.tree_id = self.member1.tree_id
        super().save(*args, **kwargs) #it invokes the parent class's save functionality.

    def clean(self):
        if not (self.member1_id and self.member2_id):
            return
        if not self.tree_id:
            self.tree_id = self.member1.tree_id
        # DB-2: both members in the same tree as the relationship.
        if not (self.member1.tree_id == self.member2.tree_id == self.tree_id):
            raise ValidationError("Both members must belong to the same family tree.")
        if self.start_date and self.relationship_type != RelationshipType.SPOUSE:
            raise ValidationError({"start_date": "Only a Spouse relationship can have a marriage date."})
        # FR-17 / DB-3: the parent must not already be a descendant of the child.
        #prevents cycles in parent-child relationships
        if self.relationship_type in PARENT_TYPES and self.member2_id in self.ancestor_ids(
            self.member1_id, self.tree_id, exclude_pk=self.pk
        ):
            raise ValidationError("This relationship would make a member their own ancestor.")

    @classmethod
    def ancestor_ids(cls, member_id, tree_id, exclude_pk=None):
        """All ancestor IDs of member_id (one query; fine for trees of a few hundred)."""
        edges = cls.objects.filter(tree_id=tree_id, relationship_type__in=PARENT_TYPES)
        if exclude_pk:
            edges = edges.exclude(pk=exclude_pk)
        parents_of = {}
        for parent_id, child_id in edges.values_list("member1_id", "member2_id"):
            parents_of.setdefault(child_id, []).append(parent_id)
        seen, stack = set(), [member_id] #seen: Stores all ancestor IDs already discovered.
                                         #stack: Stores members whose parents we still need to explore.
        #DFS guyyss
        while stack:
            for parent_id in parents_of.get(stack.pop(), []):
                if parent_id not in seen:
                    seen.add(parent_id)
                    stack.append(parent_id)
        return seen


class Document(models.Model):
    """Record attached to a member, e.g. birth certificate (FR-6, IR-4, DB-7)."""

    member = models.ForeignKey(FamilyMember, on_delete=models.CASCADE, related_name="documents")
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, db_column="uploaded_by",
        related_name="+",
    )
    file = models.FileField(
        upload_to=private_upload_path,
        max_length=255,
        db_column="file_path",
        validators=[FileExtensionValidator(DOCUMENT_EXTENSIONS), validate_upload_size],
    )
    file_type = models.CharField(max_length=10, editable=False)  # pdf / jpg / png
    file_size = models.PositiveIntegerField(editable=False)  # bytes
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "document"
        ordering = ["-uploaded_at"]

    def __str__(self):
        return os.path.basename(self.file.name)

    def save(self, *args, **kwargs):
        if self.file:
            self.file_type = self.file.name.rsplit(".", 1)[-1].lower()[:10]
            self.file_size = self.file.size
        super().save(*args, **kwargs)


# --------------------------------------------------------------------------
# suggest_request (Collaborator -> Owner approval)
# --------------------------------------------------------------------------

class ChangeType(models.TextChoices):
    ADD_MEMBER = "ADD_MEMBER", "Add member"
    UPDATE_MEMBER = "UPDATE_MEMBER", "Update member"
    ADD_MEDIA = "ADD_MEDIA", "Add media"


class SuggestionStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"
    OUTDATED = "OUTDATED", "Outdated"  # FR-21: member changed since it was submitted


class SuggestRequest(models.Model):
    """A Collaborator's proposed change (FR-12 .. FR-14, FR-21, FR-22, DB-4).

    proposed_data holds the member fields for ADD_MEMBER / UPDATE_MEMBER,
    e.g. {"first_name": "Ana", "birth_date": "1950-03-02"}.
    """

    tree = models.ForeignKey(FamilyTree, on_delete=models.CASCADE, related_name="suggestions")
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column="submitted_by",
        related_name="suggestions",
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        db_column="reviewed_by", related_name="+",
    )
    target_member = models.ForeignKey(
        FamilyMember, on_delete=models.CASCADE, null=True, blank=True, related_name="suggestions"
    )
    change_type = models.CharField(max_length=20, choices=ChangeType.choices)
    description = models.TextField()
    proposed_data = models.JSONField(null=True, blank=True)
    proposed_file = models.FileField(  # ADD_MEDIA
        upload_to=private_upload_path,
        max_length=255,
        null=True,
        blank=True,
        validators=[FileExtensionValidator(DOCUMENT_EXTENSIONS), validate_upload_size],
    )
    based_on_version = models.PositiveIntegerField(null=True, blank=True)  # FR-21
    status = models.CharField(
        max_length=20, choices=SuggestionStatus.choices, default=SuggestionStatus.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "suggest_request"
        ordering = ["created_at"]
        indexes = [models.Index(fields=["tree", "status"])]
        constraints = [
            models.CheckConstraint(
                condition=Q(change_type__in=ChangeType.values), name="suggestion_change_type_valid"
            ),
            models.CheckConstraint(
                condition=Q(status__in=SuggestionStatus.values), name="suggestion_status_valid"
            ),
            models.CheckConstraint(
                condition=Q(change_type=ChangeType.ADD_MEMBER) | Q(target_member__isnull=False),
                name="suggestion_target_required",
            ),
        ]

    def __str__(self):
        return f"{self.get_change_type_display()} ({self.status})"

    def save(self, *args, **kwargs):
        if self.target_member_id and self.based_on_version is None:
            self.based_on_version = self.target_member.version
        super().save(*args, **kwargs)

    def clean(self):
        if self.target_member_id and self.target_member.tree_id != self.tree_id:  # DB-2
            raise ValidationError("Target member belongs to a different tree.")
        if self.change_type != ChangeType.ADD_MEMBER and not self.target_member_id:
            raise ValidationError({"target_member": "This change type needs a target member."})
        if self.change_type == ChangeType.ADD_MEDIA and not self.proposed_file:
            raise ValidationError({"proposed_file": "ADD_MEDIA needs a file."})
        if (
            self._state.adding
            and self.submitted_by_id
            and not TreeCollaborator.objects.filter(tree_id=self.tree_id, user_id=self.submitted_by_id).exists()
        ):
            raise ValidationError("Only Collaborators of this tree can submit suggestions.")
