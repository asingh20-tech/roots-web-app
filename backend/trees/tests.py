"""Schema tests for DB-2, DB-3, DB-6, FR-5, FR-16, FR-17, FR-21, SA-2."""

from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError, connection, transaction
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import (
    FamilyMember,
    FamilyTree,
    Invitation,
    Relationship,
    RelationshipType,
    SuggestionStatus,
    SuggestRequest,
    TreeCollaborator,
)
from .services import OutdatedSuggestion, approve_suggestion

User = get_user_model()


class SchemaTests(TestCase):
    #setUp() is a special testing method that Django runs before each test method.
    #It creates the sample data needed for your tests.
    def setUp(self):
        self.owner = User.objects.create_user("owner", email="owner@example.com")
        self.collab = User.objects.create_user("collab", email="collab@example.com")
        self.tree = FamilyTree.objects.create(name="Test Family", owner=self.owner)
        self.other_tree = FamilyTree.objects.create(name="Other", owner=self.owner)
        self.grandpa = FamilyMember.objects.create(tree=self.tree, first_name="Abe", last_name="Doe")
        self.dad = FamilyMember.objects.create(tree=self.tree, first_name="Bob", last_name="Doe")
        self.kid = FamilyMember.objects.create(tree=self.tree, first_name="Cal", last_name="Doe")
        self.stranger = FamilyMember.objects.create(tree=self.other_tree, first_name="S", last_name="T")
        for parent, child in [(self.grandpa, self.dad), (self.dad, self.kid)]:
            Relationship.objects.create(tree=self.tree, member1=parent, member2=child,
                                        relationship_type=RelationshipType.PARENT)
        self.invite, self.raw_token = Invitation.create_for(self.tree, self.owner)

    def join(self):
        return TreeCollaborator.objects.create(tree=self.tree, user=self.collab, invitation=self.invite)

    # DB-3 / FR-16
    def test_death_before_birth_rejected(self):
        m = FamilyMember(tree=self.tree, first_name="X", last_name="Y",
                         birth_date=date(2000, 1, 1), death_date=date(1990, 1, 1))
        with self.assertRaises(ValidationError):
            m.full_clean()
        with self.assertRaises(IntegrityError), transaction.atomic():
            m.save()

    # DB-3 / FR-17
    def test_own_ancestor_rejected(self):
        r = Relationship(tree=self.tree, member1=self.kid, member2=self.grandpa,
                         relationship_type=RelationshipType.PARENT)
        with self.assertRaises(ValidationError):
            r.full_clean()

    # DB-2 (Django check)
    def test_cross_tree_relationship_rejected_by_clean(self):
        r = Relationship(tree=self.tree, member1=self.kid, member2=self.stranger,
                         relationship_type=RelationshipType.SPOUSE)
        with self.assertRaises(ValidationError):
            r.full_clean()

    # DB-2 (composite FK in PostgreSQL, migration 0002)
    def test_cross_tree_relationship_rejected_by_database(self):
        if connection.vendor != "postgresql":
            self.skipTest("composite FKs are PostgreSQL-only")
        with self.assertRaises(IntegrityError), transaction.atomic():
            #Tries to connect two people from different family trees. PostgreSQL should reject this.
            Relationship.objects.create(tree=self.tree, member1=self.kid, member2=self.stranger,
                                        relationship_type=RelationshipType.SIBLING)
        other_invite, _ = Invitation.create_for(self.other_tree, self.owner)
        # Tries to join the other tree with an invitation from a different tree. PostgreSQL should reject this.
        with self.assertRaises(IntegrityError), transaction.atomic():
            TreeCollaborator.objects.create(tree=self.tree, user=self.collab, invitation=other_invite)

    # FR-5
    def test_child_stored_as_reverse_parent(self):
        m1, m2, t = Relationship.normalize(self.kid, self.dad, "CHILD")
        self.assertEqual((m1, m2, t), (self.dad, self.kid, RelationshipType.PARENT))
        with self.assertRaises(IntegrityError), transaction.atomic():
            Relationship.objects.create(tree=self.tree, member1=self.kid, member2=self.dad,
                                        relationship_type="CHILD")

    def test_spouse_pair_not_duplicated_and_marriage_date_only_for_spouse(self):
        spouse = FamilyMember.objects.create(tree=self.tree, first_name="Dee", last_name="Roe")
        Relationship.objects.create(tree=self.tree, member1=self.dad, member2=spouse,
                                    relationship_type=RelationshipType.SPOUSE,