"""Approve / reject suggestions (FR-13, FR-14, FR-21, FR-22, SA-3).

Each call runs in one transaction and locks the suggestion and the affected
member rows, so two approvals at the same time are applied one after another.
"""

from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.utils import timezone

from .models import (
    ChangeType,
    Document,
    FamilyMember,
    Relationship,
    SuggestionStatus,
    SuggestRequest,
)

EDITABLE_MEMBER_FIELDS = {"first_name", "last_name", "gender", "birth_date", "death_date"}
REVIEWABLE = [SuggestionStatus.PENDING, SuggestionStatus.OUTDATED]


class OutdatedSuggestion(ValidationError):
    """Raised so the UI can show current vs proposed values side by side (FR-21).

    The transaction is rolled back when this is raised, so the caller must
    mark the suggestion OUTDATED itself (see mark_outdated)."""


def _lock_reviewable(suggestion_id, owner):
    s = SuggestRequest.objects.select_for_update().select_related("tree").get(pk=suggestion_id)
    if s.tree.owner_id != owner.pk:  # SA-1: only the Tree Owner reviews
        raise PermissionDenied("Only the Tree Owner can review suggestions.")
    if s.status not in REVIEWABLE:
        raise ValidationError("This suggestion has already been reviewed.")
    return s


def _member_fields(data):
    data = data or {}
    unknown = set(data) - EDITABLE_MEMBER_FIELDS
    if unknown:
        raise ValidationError(f"Unknown fields: {', '.join(sorted(unknown))}")
    return data


def _finish(s, owner, status, extra_fields=()):
    s.status = status
    s.reviewed_by = owner
    s.reviewed_at = timezone.now()
    s.save(update_fields=["status", "reviewed_by", "reviewed_at", *extra_fields])
    return s


def compare(suggestion):
    """FR-21: {field: {"current": ..., "proposed": ...}} for UPDATE_MEMBER."""
    if suggestion.change_type != ChangeType.UPDATE_MEMBER or not suggestion.target_member_id:
        return None
    member = suggestion.target_member
    out = {}
    for field, proposed in (suggestion.proposed_data or {}).items():
        current = getattr(member, field, None)
        out[field] = {
            "current": current.isoformat() if hasattr(current, "isoformat") else current,
            "proposed": proposed,
        }
    return out


def mark_outdated(suggestion_id):
    """Call after catching OutdatedSuggestion (outside the rolled-back block)."""
    SuggestRequest.objects.filter(pk=suggestion_id, status=SuggestionStatus.PENDING).update(
        status=SuggestionStatus.OUTDATED
    )


@transaction.atomic
def approve_suggestion(suggestion_id, owner, confirm_outdated=False):
    """Apply a suggestion. If the member changed since it was submitted, the
    Owner must review the side-by-side view and pass confirm_outdated=True."""
    s = _lock_reviewable(suggestion_id, owner)
    extra = []

    if s.change_type == ChangeType.ADD_MEMBER:
        member = FamilyMember(tree=s.tree, **_member_fields(s.proposed_data))
        member.full_clean()
        member.save()
        s.target_member = member  # link the suggestion to the member it created
        extra.append("target_member")
    elif s.change_type == ChangeType.ADD_RELATIONSHIP:
        data = s.proposed_data or {}
        allowed_fields = {"member1", "member2", "relationship_type", "start_date"}
        unknown = set(data) - allowed_fields
        if unknown:
            raise ValidationError(f"Unknown relationship fields: {', '.join(sorted(unknown))}")

        try:
            member1_id = int(data["member1"])
            member2_id = int(data["member2"])
        except (KeyError, TypeError, ValueError):
            raise ValidationError("A relationship suggestion needs two valid member IDs.")

        member_ids = {member1_id, member2_id}
        members = {
            member.pk: member
            for member in FamilyMember.objects.select_for_update().filter(
                tree=s.tree,
                pk__in=member_ids,
            )
        }
        if len(member_ids) != 2 or set(members) != member_ids:
            raise ValidationError("Both relationship members must be different members of this tree.")

        relationship = Relationship(
            tree=s.tree,
            member1=members[member1_id],
            member2=members[member2_id],
            relationship_type=data.get("relationship_type"),
            start_date=data.get("start_date"),
        )
        relationship.full_clean()
        relationship.save()
    else:
        member = FamilyMember.objects.select_for_update().get(pk=s.target_member_id)
        if member.version != s.based_on_version and not confirm_outdated:
            raise OutdatedSuggestion("Member changed since this suggestion was made.")
        if s.change_type == ChangeType.UPDATE_MEMBER:
            for field, value in _member_fields(s.proposed_data).items():
                setattr(member, field, value)
            member.full_clean()
            member.save()  # also marks other pending suggestions OUTDATED
        elif s.change_type == ChangeType.ADD_MEDIA:
            Document.objects.create(member=member, file=s.proposed_file, uploaded_by=s.submitted_by)

    return _finish(s, owner, SuggestionStatus.APPROVED, extra)


@transaction.atomic
def reject_suggestion(suggestion_id, owner):
    s = _lock_reviewable(suggestion_id, owner)
    if s.proposed_file:  # rejected media is discarded (FR-14)
        storage, name = s.proposed_file.storage, s.proposed_file.name
        transaction.on_commit(lambda: storage.delete(name))
        s.proposed_file = None
        return _finish(s, owner, SuggestionStatus.REJECTED, ["proposed_file"])
    return _finish(s, owner, SuggestionStatus.REJECTED)
