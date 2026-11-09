"""Delete stored files when their rows are deleted (DB-6).

Runs for cascades too (deleting a tree or member), after the transaction
commits so a rolled-back delete keeps its files.
"""
from django.db import transaction
from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models import Document, FamilyMember, SuggestRequest


def _delete_file(field_file):
    if field_file and field_file.name:
        storage, name = field_file.storage, field_file.name
        transaction.on_commit(lambda: storage.delete(name))

@receiver(post_delete, sender=Document)
def delete_document_file(sender, instance, **kwargs):
    _delete_file(instance.file)

@receiver(post_delete, sender=FamilyMember)
def delete_family_member_file(sender, instance, **kwargs):
    _delete_file(instance.photo)

@receiver(post_delete, sender=SuggestRequest)
def delete_suggest_request_file(sender, instance, **kwargs):
    _delete_file(instance.proposed_file)