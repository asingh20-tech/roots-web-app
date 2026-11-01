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
                                    start_date=date(1980, 6, 1))
        with self.assertRaises(IntegrityError), transaction.atomic():
            Relationship.objects.create(tree=self.tree, member1=spouse, member2=self.dad,
                                        relationship_type=RelationshipType.SPOUSE)
        with self.assertRaises(IntegrityError), transaction.atomic():
            Relationship.objects.create(tree=self.tree, member1=self.kid, member2=spouse,
                                        relationship_type=RelationshipType.SIBLING,
                                        start_date=date(1990, 1, 1))

    # DB-6
    def test_delete_tree_cascades(self):
        self.join()
        SuggestRequest.objects.create(tree=self.tree, submitted_by=self.collab,
                                      change_type="ADD_MEMBER", description="new", proposed_data={})
        self.tree.delete()
        for model in (FamilyMember, Relationship, Invitation, TreeCollaborator, SuggestRequest):
            self.assertFalse(model.objects.filter(tree=self.tree.pk).exists(), model.__name__)

    # SA-2, FR-10, FR-19
    def test_invitation_hashed_7_day_expiry_and_revocable(self):
        self.assertGreaterEqual(len(self.raw_token), 32)
        self.assertNotEqual(self.invite.token_hash, self.raw_token)
        lifetime = self.invite.expires_at - timezone.now()
        self.assertTrue(timedelta(days=6, hours=23) < lifetime <= timedelta(days=7))
        self.assertEqual(Invitation.find_valid(self.raw_token), self.invite)
        self.invite.revoke()
        self.assertFalse(self.invite.is_active)
        self.assertIsNone(Invitation.find_valid(self.raw_token))

    def test_expired_invitation_invalid(self):
        self.invite.expires_at = timezone.now() - timedelta(seconds=1)
        self.invite.save()
        self.assertIsNone(Invitation.find_valid(self.raw_token))

    # DB-4
    def test_accessible_trees(self):
        self.assertFalse(FamilyTree.objects.accessible_to(self.collab).exists())
        self.join()
        self.assertEqual(list(FamilyTree.objects.accessible_to(self.collab)), [self.tree])

    # FR-21, FR-22
    def test_outdated_suggestion(self):
        self.join()
        s1 = SuggestRequest.objects.create(tree=self.tree, submitted_by=self.collab,
                                           change_type="UPDATE_MEMBER", description="fix name",
                                           target_member=self.kid, proposed_data={"first_name": "Cali"})
        s2 = SuggestRequest.objects.create(tree=self.tree, submitted_by=self.collab,
                                           change_type="UPDATE_MEMBER", description="add birth",
                                           target_member=self.kid,
                                           proposed_data={"birth_date": "2001-02-03"})
        approve_suggestion(s1.pk, self.owner)
        s2.refresh_from_db()
        self.assertEqual(s2.status, SuggestionStatus.OUTDATED)
        with self.assertRaises(OutdatedSuggestion):
            approve_suggestion(s2.pk, self.owner)
        approve_suggestion(s2.pk, self.owner, confirm_outdated=True)
        self.kid.refresh_from_db()
        self.assertEqual((self.kid.first_name, self.kid.birth_date), ("Cali", date(2001, 2, 3)))


class TreeListCreateRequirementTests(APITestCase):
    """SRS tests for the authenticated tree list/create endpoint."""

    def setUp(self):
        self.user = User.objects.create_user("api-user", email="api-user@example.com")
        self.tree_owner = User.objects.create_user(
            "tree-owner", email="tree-owner@example.com"
        )
        self.outsider = User.objects.create_user(
            "outsider", email="outsider@example.com"
        )
        self.owned_tree = FamilyTree.objects.create(
            name="User-Owned Tree", owner=self.user
        )
        self.shared_tree = FamilyTree.objects.create(
            name="Shared Tree", owner=self.tree_owner
        )
        self.private_tree = FamilyTree.objects.create(
            name="Private Tree", owner=self.outsider
        )
        invitation, _ = Invitation.create_for(self.shared_tree, self.tree_owner)
        TreeCollaborator.objects.create(
            tree=self.shared_tree,
            user=self.user,
            invitation=invitation,
        )
        self.url = reverse("family-tree-list-create")

    # FR-3: A logged-in user can create a named tree and becomes its Tree Owner.
    # IR-7: Frontend-backend data is exchanged as JSON.
    def test_fr3_ir7_logged_in_user_creates_tree_and_becomes_owner(self):
        self.client.force_login(self.user)

        response = self.client.post(
            self.url,
            {"name": "Smith Family", "description": "Our family history"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response["Content-Type"], "application/json")
        created_tree = FamilyTree.objects.get(pk=response.data["id"])
        self.assertEqual(created_tree.name, "Smith Family")
        self.assertEqual(created_tree.description, "Our family history")
        self.assertEqual(created_tree.owner, self.user)

    # FR-3: A tree description is optional.
    def test_fr3_logged_in_user_creates_tree_without_description(self):
        self.client.force_login(self.user)

        response = self.client.post(
            self.url,
            {"name": "Description Optional"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_tree = FamilyTree.objects.get(pk=response.data["id"])
        self.assertIsNone(created_tree.description)
        self.assertEqual(created_tree.owner, self.user)

    # FR-3: Tree creation is available to logged-in users only.
    def test_fr3_logged_out_user_cannot_create_tree(self):
        response = self.client.post(
            self.url,
            {"name": "Unauthorized Tree"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(FamilyTree.objects.filter(name="Unauthorized Tree").exists())

    # FR-3 / DB-2: The authenticated user becomes the one and only Tree Owner;
    # a client-supplied owner ID cannot assign ownership to another account.
    def test_fr3_db2_client_cannot_assign_a_different_tree_owner(self):
        self.client.force_login(self.user)

        response = self.client.post(
            self.url,
            {"name": "Owner Protected", "owner": self.outsider.pk},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_tree = FamilyTree.objects.get(pk=response.data["id"])
        self.assertEqual(created_tree.owner, self.user)

    # DB-4 / DC-4: A user reads only trees they own or collaborate on.
    def test_db4_dc4_user_reads_only_owned_and_collaborated_trees(self):
        self.client.force_login(self.user)

        response = self.client.get(self.url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = {tree["id"] for tree in response.data}
        self.assertEqual(returned_ids, {self.owned_tree.pk, self.shared_tree.pk})
        self.assertNotIn(self.private_tree.pk, returned_ids)

    # DB-4 / DC-4: Tree data is not visible without an authenticated account.
    def test_db4_dc4_logged_out_user_cannot_read_tree_data(self):
        response = self.client.get(self.url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class TreeReadEndpointTests(APITestCase):
    """SRS tests for tree detail, member list, and relationship list endpoints (DB-4, DC-4, FR-9)."""

    def setUp(self):
        self.user = User.objects.create_user("reader", email="reader@example.com")
        self.outsider = User.objects.create_user("stranger", email="stranger@example.com")
        self.tree = FamilyTree.objects.create(name="Mine", owner=self.user)
        self.private_tree = FamilyTree.objects.create(name="Not Mine", owner=self.outsider)
        self.mom = FamilyMember.objects.create(tree=self.tree, first_name="Ann", last_name="Lee")
        self.son = FamilyMember.objects.create(tree=self.tree, first_name="Ben", last_name="Lee")
        self.rel = Relationship.objects.create(tree=self.tree, member1=self.mom, member2=self.son,
                                               relationship_type=RelationshipType.PARENT)
        hidden = FamilyMember.objects.create(tree=self.private_tree, first_name="X", last_name="Y")
        self.hidden_id = hidden.pk

    # DB-4: owner can read their tree
    def test_db4_user_retrieves_own_tree(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse("family-tree-detail", args=[self.tree.pk]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Mine")

    # DB-4 / DC-4: another user's tree is hidden (404, so its existence isn't leaked)
    def test_db4_dc4_user_cannot_retrieve_other_tree(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse("family-tree-detail", args=[self.private_tree.pk]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # FR-9: members of an accessible tree are listed with full_name
    def test_fr9_lists_members_of_accessible_tree(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse("family-member-list", args=[self.tree.pk]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual({m["full_name"] for m in response.data}, {"Ann Lee", "Ben Lee"})
        self.assertNotIn(self.hidden_id, {m["id"] for m in response.data})

    # DB-4 / DC-4: members of an inaccessible tree are not returned
    def test_db4_dc4_cannot_list_members_of_other_tree(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse("family-member-list", args=[self.private_tree.pk]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # FR-7: relationships of an accessible tree are listed
    def test_fr7_lists_relationships_of_accessible_tree(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse("relationship-list", args=[self.tree.pk]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["relationship_type"], "PARENT")

    # DB-4 / DC-4: relationships of an inaccessible tree are not returned
    def test_db4_dc4_cannot_list_relationships_of_other_tree(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse("relationship-list", args=[self.private_tree.pk]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # DB-4: all read endpoints require login
    def test_db4_logged_out_user_blocked_on_read_endpoints(self):
        for name in ("family-tree-detail", "family-member-list", "relationship-list"):
            response = self.client.get(reverse(name, args=[self.tree.pk]))
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN, name)
