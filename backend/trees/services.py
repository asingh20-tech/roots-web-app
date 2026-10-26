"""Approve / reject suggestions (FR-13, FR-14, FR-21, FR-22, SA-3).

Each call runs in one transaction and locks the suggestion and its target
member, so two approvals at the same time are applied one after another.
"""

from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.utils import timezone

from .models import ChangeType, Document, FamilyMember, SuggestionStatus, SuggestRequest

EDITABLE_MEMBER_FIELDS = {"first_name", "last_name", "gender", "birth_date", "death_date"}
REVIEWABLE = [SuggestionStatus.PENDING, SuggestionStatus.OUTDATED]


class OutdatedSuggestion(ValidationError):
    """Raised so the UI can show current vs proposed values side by side (FR-21)."""


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


def _finish(s, owner, status):
    s.status = status
    s.reviewed_by = owner
    s.reviewed_at = timezone.now()
    s.save(update_fields=["status", "reviewed_by", "reviewed_at"])
    return s


@transaction.atomic
def approve_suggestion(suggestion_id, owner, confirm_outdated=False):
    """Apply a suggestion. If the member changed since it was submitted, the
    Owner must review the side-by-side view and pass confirm_outdated=True."""
    s = _lock_reviewable(suggestion_id, owner)

    if s.change_type == ChangeType.ADD_MEMBER:
        member = FamilyMember(tree=s.tree, **_member_fields(s.proposed_data))
        member.full_clean()
        member.save()
    else:
        member = FamilyMember.objects.select_for_update().get(pk=s.target_member_id)
        if member.version != s.based_on_version and not confirm_outdated:
            if s.status != SuggestionStatus.OUTDATED:
                s.status = SuggestionStatus.OUTDATED
                s.save(update_fields=["status"])
            raise OutdatedSuggestion("Member changed since this suggestion was made.")
        if s.change_type == ChangeType.UPDATE_MEMBER:
            for field, value in _member_fields(s.proposed_data).items():
                setattr(member, field, value)
            member.full_clean()
            member.save()  # also marks other pending suggestions OUTDATED
        elif s.change_type == ChangeType.ADD_MEDIA:
            Document.objects.create(member=member, file=s.proposed_file, uploaded_by=s.submitted_by)

    return _finish(s, owner, SuggestionStatus.APPROVED)


@transaction.atomic
def reject_suggestion(suggestion_id, owner):
    s = _lock_reviewable(suggestion_id, owner)
    return _finish(s, owner, SuggestionStatus.REJECTED)
