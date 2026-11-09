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
    ChangeType,
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

    

class P1WriteEndpointTests(APITestCase):
    """SRS tests for write endpoints: FR-2, FR-3, FR-4, FR-5, FR-16, FR-17, SA-1, DB-2, DB-6."""

    def setUp(self):
        self.owner = User.objects.create_user("p1-owner", email="p1-owner@example.com")
        self.collab = User.objects.create_user("p1-collab", email="p1-collab@example.com")
        self.outsider = User.objects.create_user("p1-out", email="p1-out@example.com")
        self.tree = FamilyTree.objects.create(name="Lee Family", owner=self.owner)
        self.other_tree = FamilyTree.objects.create(name="Other", owner=self.outsider)
        invite, _ = Invitation.create_for(self.tree, self.owner)
        TreeCollaborator.objects.create(tree=self.tree, user=self.collab, invitation=invite)
        self.grandma = FamilyMember.objects.create(tree=self.tree, first_name="Gia", last_name="Lee")
        self.mom = FamilyMember.objects.create(tree=self.tree, first_name="Ann", last_name="Lee")
        self.kid = FamilyMember.objects.create(tree=self.tree, first_name="Ben", last_name="Lee")
        self.outside_member = FamilyMember.objects.create(tree=self.other_tree, first_name="Zed", last_name="Q")
        Relationship.objects.create(tree=self.tree, member1=self.grandma, member2=self.mom,
                                    relationship_type=RelationshipType.PARENT)
        self.members_url = reverse("family-member-list", args=[self.tree.pk])
        self.rels_url = reverse("relationship-list", args=[self.tree.pk])

    def member_url(self, member):
        return reverse("family-member-detail", args=[self.tree.pk, member.pk])

    # ----- Accounts (FR-1, FR-2) -----

    def test_fr1_me_returns_logged_in_user(self):
        self.client.force_login(self.owner)
        response = self.client.get(reverse("me"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "p1-owner@example.com")

    def test_fr1_me_requires_login(self):
        self.assertEqual(self.client.get(reverse("me")).status_code, status.HTTP_403_FORBIDDEN)

    def test_fr2_logout_ends_session(self):
        self.client.force_login(self.owner)
        self.assertEqual(self.client.post(reverse("logout")).status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(self.client.get(reverse("me")).status_code, status.HTTP_403_FORBIDDEN)

    # ----- Trees (FR-3, SA-1, DB-6) -----

    def test_fr3_owner_renames_tree(self):
        self.client.force_login(self.owner)
        url = reverse("family-tree-detail", args=[self.tree.pk])
        response = self.client.patch(url, {"name": "Lee-Park Family"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.tree.refresh_from_db()
        self.assertEqual(self.tree.name, "Lee-Park Family")

    def test_sa1_collaborator_cannot_edit_or_delete_tree(self):
        self.client.force_login(self.collab)
        url = reverse("family-tree-detail", args=[self.tree.pk])
        self.assertEqual(self.client.patch(url, {"name": "X"}, format="json").status_code,
                         status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.delete(url).status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(FamilyTree.objects.filter(pk=self.tree.pk).exists())

    def test_db6_owner_deletes_tree_and_children(self):
        self.client.force_login(self.owner)
        response = self.client.delete(reverse("family-tree-detail", args=[self.tree.pk]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(FamilyMember.objects.filter(tree_id=self.tree.pk).exists())
        self.assertFalse(Relationship.objects.filter(tree_id=self.tree.pk).exists())

    def test_tree_reports_is_owner_flag(self):
        self.client.force_login(self.collab)
        response = self.client.get(reverse("family-tree-detail", args=[self.tree.pk]))
        self.assertFalse(response.data["is_owner"])

    # ----- Members (FR-4, FR-16, SA-1) -----

    def test_fr4_owner_adds_member(self):
        self.client.force_login(self.owner)
        response = self.client.post(self.members_url, {
            "first_name": "Cy", "last_name": "Lee", "gender": "MALE", "birth_date": "2010-05-01",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(FamilyMember.objects.get(pk=response.data["id"]).tree, self.tree)

    def test_fr4_owner_edits_member_and_version_increments(self):
        self.client.force_login(self.owner)
        response = self.client.patch(self.member_url(self.kid), {"first_name": "Benny"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.kid.refresh_from_db()
        self.assertEqual((self.kid.first_name, self.kid.version), ("Benny", 2))

    def test_fr4_owner_deletes_member(self):
        self.client.force_login(self.owner)
        response = self.client.delete(self.member_url(self.kid))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(FamilyMember.objects.filter(pk=self.kid.pk).exists())

    def test_fr16_death_before_birth_returns_400_with_message(self):
        self.client.force_login(self.owner)
        response = self.client.post(self.members_url, {
            "first_name": "X", "last_name": "Y", "birth_date": "2000-01-01", "death_date": "1990-01-01",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("death_date", response.data)

    def test_ir2_name_over_50_chars_rejected(self):
        self.client.force_login(self.owner)
        response = self.client.post(self.members_url, {"first_name": "A" * 51, "last_name": "B"},
                                    format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_sa1_collaborator_can_read_but_not_write_members(self):
        self.client.force_login(self.collab)
        self.assertEqual(self.client.get(self.members_url).status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post(self.members_url, {"first_name": "N", "last_name": "O"},
                                          format="json").status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.patch(self.member_url(self.kid), {"first_name": "Z"},
                                           format="json").status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.delete(self.member_url(self.kid)).status_code,
                         status.HTTP_403_FORBIDDEN)

    def test_dc4_outsider_cannot_add_member(self):
        self.client.force_login(self.outsider)
        response = self.client.post(self.members_url, {"first_name": "N", "last_name": "O"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ----- Relationships (FR-5, FR-17, DB-2) -----

    def test_fr5_owner_creates_parent_relationship(self):
        self.client.force_login(self.owner)
        response = self.client.post(self.rels_url, {
            "member1": self.mom.pk, "member2": self.kid.pk, "relationship_type": "PARENT",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

    def test_fr5_child_is_stored_as_reverse_parent(self):
        self.client.force_login(self.owner)
        response = self.client.post(self.rels_url, {
            "member1": self.kid.pk, "member2": self.mom.pk, "relationship_type": "CHILD",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual((response.data["member1"], response.data["member2"], response.data["relationship_type"]),
                         (self.mom.pk, self.kid.pk, "PARENT"))

    def test_fr5_spouse_with_marriage_date(self):
        self.client.force_login(self.owner)
        spouse = FamilyMember.objects.create(tree=self.tree, first_name="Sam", last_name="Park")
        response = self.client.post(self.rels_url, {
            "member1": self.mom.pk, "member2": spouse.pk, "relationship_type": "SPOUSE",
            "start_date": "1995-06-10",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

    def test_fr5_marriage_date_only_for_spouse(self):
        self.client.force_login(self.owner)
        response = self.client.post(self.rels_url, {
            "member1": self.mom.pk, "member2": self.kid.pk, "relationship_type": "SIBLING",
            "start_date": "1995-06-10",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_fr17_own_ancestor_returns_400(self):
        self.client.force_login(self.owner)
        response = self.client.post(self.rels_url, {
            "member1": self.mom.pk, "member2": self.grandma.pk, "relationship_type": "PARENT",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_relationship_returns_400(self):
        self.client.force_login(self.owner)
        response = self.client.post(self.rels_url, {
            "member1": self.grandma.pk, "member2": self.mom.pk, "relationship_type": "PARENT",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_db2_cross_tree_relationship_returns_400(self):
        self.client.force_login(self.owner)
        response = self.client.post(self.rels_url, {
            "member1": self.mom.pk, "member2": self.outside_member.pk, "relationship_type": "SIBLING",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_sa1_collaborator_cannot_create_or_delete_relationship(self):
        self.client.force_login(self.collab)
        response = self.client.post(self.rels_url, {
            "member1": self.mom.pk, "member2": self.kid.pk, "relationship_type": "PARENT",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        rel = Relationship.objects.filter(tree=self.tree).first()
        url = reverse("relationship-detail", args=[self.tree.pk, rel.pk])
        self.assertEqual(self.client.delete(url).status_code, status.HTTP_403_FORBIDDEN)

    def test_fr5_owner_deletes_relationship(self):
        self.client.force_login(self.owner)
        rel = Relationship.objects.filter(tree=self.tree).first()
        url = reverse("relationship-detail", args=[self.tree.pk, rel.pk])
        self.assertEqual(self.client.delete(url).status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Relationship.objects.filter(pk=rel.pk).exists())


class RelationshipSuggestionRequirementTests(APITestCase):
    """SRS extension tests for collaborator-proposed relationships.

    Extends FR-12 and IR-6 with ADD_RELATIONSHIP while preserving FR-5,
    FR-13, FR-14, FR-17, IR-3, DB-2, DB-4, and SA-1.
    """

    def setUp(self):
        self.owner = User.objects.create_user(
            "relationship-owner", email="relationship-owner@example.com"
        )
        self.collab = User.objects.create_user(
            "relationship-collab", email="relationship-collab@example.com"
        )
        self.outsider = User.objects.create_user(
            "relationship-outsider", email="relationship-outsider@example.com"
        )
        self.tree = FamilyTree.objects.create(name="Relationship Tree", owner=self.owner)
        self.other_tree = FamilyTree.objects.create(name="Other Tree", owner=self.outsider)
        invitation, _ = Invitation.create_for(self.tree, self.owner)
        TreeCollaborator.objects.create(
            tree=self.tree,
            user=self.collab,
            invitation=invitation,
        )

        self.grandparent = FamilyMember.objects.create(
            tree=self.tree, first_name="Grace", last_name="Lee"
        )
        self.parent = FamilyMember.objects.create(
            tree=self.tree, first_name="Pat", last_name="Lee"
        )
        self.child = FamilyMember.objects.create(
            tree=self.tree, first_name="Casey", last_name="Lee"
        )
        self.sibling = FamilyMember.objects.create(
            tree=self.tree, first_name="Sam", last_name="Lee"
        )
        self.outside_member = FamilyMember.objects.create(
            tree=self.other_tree, first_name="Outside", last_name="Person"
        )
        Relationship.objects.create(
            tree=self.tree,
            member1=self.grandparent,
            member2=self.parent,
            relationship_type=RelationshipType.PARENT,
        )
        Relationship.objects.create(
            tree=self.tree,
            member1=self.parent,
            member2=self.child,
            relationship_type=RelationshipType.PARENT,
        )
        self.suggestions_url = reverse("suggestion-list", args=[self.tree.pk])

    def relationship_payload(self, member1, member2, relationship_type="SIBLING", **extra):
        proposed_data = {
            "member1": member1.pk,
            "member2": member2.pk,
            "relationship_type": relationship_type,
            **extra,
        }
        return {
            "change_type": ChangeType.ADD_RELATIONSHIP,
            "description": "Relationship information supplied by a collaborator.",
            "proposed_data": proposed_data,
        }

    # FR-12 extension, DB-4: a Collaborator creates only a pending suggestion.
    def test_collaborator_submits_pending_relationship_without_changing_tree(self):
        self.client.force_login(self.collab)
        response = self.client.post(
            self.suggestions_url,
            self.relationship_payload(self.child, self.sibling),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        suggestion = SuggestRequest.objects.get(pk=response.data["id"])
        self.assertEqual(suggestion.status, SuggestionStatus.PENDING)
        self.assertIsNone(suggestion.target_member)
        self.assertEqual(suggestion.proposed_data["member1"], self.child.pk)
        self.assertFalse(
            Relationship.objects.filter(
                member1=self.child,
                member2=self.sibling,
                relationship_type=RelationshipType.SIBLING,
            ).exists()
        )

    # FR-5, IR-3: CHILD is normalized and applied only after Owner approval.
    def test_owner_approval_creates_normalized_parent_relationship(self):
        self.client.force_login(self.collab)
        submitted = self.client.post(
            self.suggestions_url,
            self.relationship_payload(self.sibling, self.child, "CHILD"),
            format="json",
        )
        self.assertEqual(submitted.status_code, status.HTTP_201_CREATED, submitted.data)
        self.assertEqual(
            submitted.data["proposed_data"],
            {
                "member1": self.child.pk,
                "member2": self.sibling.pk,
                "relationship_type": RelationshipType.PARENT,
                "start_date": None,
            },
        )

        self.client.force_login(self.owner)
        approved = self.client.post(
            reverse("suggestion-approve", args=[self.tree.pk, submitted.data["id"]]),
            {},
            format="json",
        )

        self.assertEqual(approved.status_code, status.HTTP_200_OK, approved.data)
        self.assertEqual(approved.data["status"], SuggestionStatus.APPROVED)
        self.assertTrue(
            Relationship.objects.filter(
                tree=self.tree,
                member1=self.child,
                member2=self.sibling,
                relationship_type=RelationshipType.PARENT,
            ).exists()
        )

    # FR-14: rejection discards the proposal without changing the tree.
    def test_owner_rejection_does_not_create_relationship(self):
        self.client.force_login(self.collab)
        submitted = self.client.post(
            self.suggestions_url,
            self.relationship_payload(self.child, self.sibling),
            format="json",
        )
        self.assertEqual(submitted.status_code, status.HTTP_201_CREATED, submitted.data)

        self.client.force_login(self.owner)
        rejected = self.client.post(
            reverse("suggestion-reject", args=[self.tree.pk, submitted.data["id"]]),
            {},
            format="json",
        )

        self.assertEqual(rejected.status_code, status.HTTP_200_OK, rejected.data)
        self.assertEqual(rejected.data["status"], SuggestionStatus.REJECTED)
        self.assertFalse(
            Relationship.objects.filter(
                member1=self.child,
                member2=self.sibling,
                relationship_type=RelationshipType.SIBLING,
            ).exists()
        )

    # FR-5, IR-3: Spouse may include a marriage date.
    def test_spouse_suggestion_accepts_optional_marriage_date(self):
        self.client.force_login(self.collab)
        response = self.client.post(
            self.suggestions_url,
            self.relationship_payload(
                self.child,
                self.sibling,
                "SPOUSE",
                start_date="2020-06-15",
            ),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data["proposed_data"]["start_date"], "2020-06-15")

    # FR-5, IR-3: non-spouse relationships cannot contain marriage dates.
    def test_non_spouse_suggestion_rejects_marriage_date(self):
        self.client.force_login(self.collab)
        response = self.client.post(
            self.suggestions_url,
            self.relationship_payload(
                self.child,
                self.sibling,
                "SIBLING",
                start_date="2020-06-15",
            ),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(SuggestRequest.objects.filter(change_type=ChangeType.ADD_RELATIONSHIP).exists())

    # DB-2: both proposed members must already belong to the selected tree.
    def test_cross_tree_relationship_suggestion_is_rejected(self):
        self.client.force_login(self.collab)
        response = self.client.post(
            self.suggestions_url,
            self.relationship_payload(self.child, self.outside_member),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # FR-17, DB-3: a proposal cannot make a member their own ancestor.
    def test_ancestor_cycle_relationship_suggestion_is_rejected(self):
        self.client.force_login(self.collab)
        response = self.client.post(
            self.suggestions_url,
            self.relationship_payload(
                self.child,
                self.grandparent,
                RelationshipType.PARENT,
            ),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # FR-5: a relationship already present in the tree cannot be proposed again.
    def test_duplicate_relationship_suggestion_is_rejected(self):
        self.client.force_login(self.collab)
        response = self.client.post(
            self.suggestions_url,
            self.relationship_payload(
                self.parent,
                self.child,
                RelationshipType.PARENT,
            ),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # DB-2: one member cannot fill both sides of a relationship.
    def test_self_relationship_suggestion_is_rejected(self):
        self.client.force_login(self.collab)
        response = self.client.post(
            self.suggestions_url,
            self.relationship_payload(self.child, self.child),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # DB-4, SA-1: only Collaborators submit; only the Owner approves.
    def test_suggestion_permissions_are_enforced(self):
        payload = self.relationship_payload(self.child, self.sibling)

        self.client.force_login(self.owner)
        owner_submit = self.client.post(self.suggestions_url, payload, format="json")
        self.assertEqual(owner_submit.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_login(self.outsider)
        outsider_submit = self.client.post(self.suggestions_url, payload, format="json")
        self.assertEqual(outsider_submit.status_code, status.HTTP_404_NOT_FOUND)

        self.client.force_login(self.collab)
        submitted = self.client.post(self.suggestions_url, payload, format="json")
        self.assertEqual(submitted.status_code, status.HTTP_201_CREATED, submitted.data)
        approve_url = reverse("suggestion-approve", args=[self.tree.pk, submitted.data["id"]])
        collaborator_approve = self.client.post(approve_url, {}, format="json")
        self.assertEqual(collaborator_approve.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(
            Relationship.objects.filter(
                member1=self.child,
                member2=self.sibling,
                relationship_type=RelationshipType.SIBLING,
            ).exists()
        )
