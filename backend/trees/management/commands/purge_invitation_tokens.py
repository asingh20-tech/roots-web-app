"""Clear recoverable token material from revoked and expired invitations.

Run periodically (e.g. hourly cron). The API also purges lazily when an
owner lists links, and revocation clears the token immediately.
"""
from django.core.management.base import BaseCommand

from trees.models import Invitation


class Command(BaseCommand):
    help = "Remove encrypted tokens of revoked and expired invitation links."

    def handle(self, *args, **options):
        count = Invitation.purge_recoverable_tokens()
        self.stdout.write(f"Purged recoverable tokens from {count} invitation(s).")
