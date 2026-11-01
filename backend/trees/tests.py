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
            Relationship.objects.create(tree=self.tree, member1=self.kid, member2=self.stranger,
                                        relationship_type=RelationshipType.SIBLING)
        other_invite, _ = Invitation.create_for(self.other_tree, self.owner)
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


class TreeDetailRequirementTests(APITestCase):
    """SRS tests for retrieving one authenticated user's accessible tree."""

    def setUp(self):
        self.owner = User.objects.create_user(
            "detail-owner", email="detail-owner@example.com"
        )
        self.collaborator = User.objects.create_user(
            "detail-collaborator", email="detail-collaborator@example.com"
        )
        self.outsider = User.objects.create_user(
            "detail-outsider", email="detail-outsider@example.com"
        )
        self.tree = FamilyTree.objects.create(
            name="Detail Family",
            description="Tree returned by the detail endpoint",
            owner=self.owner,
        )
        invitation, _ = Invitation.create_for(self.tree, self.owner)
        TreeCollaborator.objects.create(
            tree=self.tree,
            user=self.collaborator,
            invitation=invitation,
        )
        self.url = reverse("family-tree-detail", args=[self.tree.pk])

    # DB-4 / DC-4 / IR-7: An Owner can read their tree as JSON.
    def test_db4_dc4_ir7_owner_retrieves_their_tree(self):
        self.client.force_login(self.owner)

        response = self.client.get(self.url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/json")
        self.assertEqual(response.data["id"], self.tree.pk)
        self.assertEqual(response.data["name"], "Detail Family")
        self.assertEqual(
            response.data["description"],
            "Tree returned by the detail endpoint",
        )

    # DB-4 / DC-4: A Collaborator can read a tree shared with them.
    def test_db4_dc4_collaborator_retrieves_shared_tree(self):
        self.client.force_login(self.collaborator)

        response = self.client.get(self.url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.tree.pk)

    # DB-4 / DC-4: A user cannot read a tree they neither own nor collaborate on.
    def test_db4_dc4_outsider_cannot_retrieve_private_tree(self):
        self.client.force_login(self.outsider)

        response = self.client.get(self.url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # DB-4 / DC-4: Tree data is unavailable without an authenticated account.
    def test_db4_dc4_logged_out_user_cannot_retrieve_tree(self):
        response = self.client.get(self.url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # DB-4 / DC-4: Unknown tree identifiers do not expose tree data.
    def test_db4_dc4_unknown_tree_id_returns_not_found(self):
        self.client.force_login(self.owner)
        missing_url = reverse("family-tree-detail", args=[999999])

        response = self.client.get(missing_url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # SA-1: A Collaborator cannot modify tree data directly through this endpoint.
    def test_sa1_collaborator_cannot_modify_tree_through_detail_endpoint(self):
        self.client.force_login(self.collaborator)

        response = self.client.patch(
            self.url,
            {"name": "Unauthorized Rename"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.tree.refresh_from_db()
        self.assertEqual(self.tree.name, "Detail Family")


class FamilyMemberListRequirementTests(APITestCase):
    """SRS tests for listing members of one accessible family tree."""

    def setUp(self):
        self.owner = User.objects.create_user(
            "member-owner", email="member-owner@example.com"
        )
        self.collaborator = User.objects.create_user(
            "member-collaborator", email="member-collaborator@example.com"
        )
        self.outsider = User.objects.create_user(
            "member-outsider", email="member-outsider@example.com"
        )
        self.tree = FamilyTree.objects.create(name="Member Family", owner=self.owner)
        self.other_tree = FamilyTree.objects.create(
            name="Owner's Other Family", owner=self.owner
        )
        self.empty_tree = FamilyTree.objects.create(
            name="Empty Family", owner=self.owner
        )
        self.private_tree = FamilyTree.objects.create(
            name="Private Family", owner=self.outsider
        )
        self.clara = FamilyMember.objects.create(
            tree=self.tree,
            first_name="Clara",
            last_name="Bennett",
            gender="FEMALE",
            birth_date=date(1965, 4, 12),
        )
        self.james = FamilyMember.objects.create(
            tree=self.tree,
            first_name="James",
            last_name="Bennett",
            gender="MALE",
        )
        self.other_member = FamilyMember.objects.create(
            tree=self.other_tree,
            first_name="Other",
            last_name="Member",
        )
        self.private_member = FamilyMember.objects.create(
            tree=self.private_tree,
            first_name="Private",
            last_name="Member",
        )
        invitation, _ = Invitation.create_for(self.tree, self.owner)
        TreeCollaborator.objects.create(
            tree=self.tree,
            user=self.collaborator,
            invitation=invitation,
        )
        self.url = reverse("family-member-list", args=[self.tree.pk])

    # FR-7 / IR-2 / IR-7: The Owner receives the selected tree's member data as JSON.
    def test_fr7_ir2_ir7_owner_lists_serialized_family_members(self):
        self.client.force_login(self.owner)

        response = self.client.get(self.url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/json")
        returned_ids = {member["id"] for member in response.data}
        self.assertEqual(returned_ids, {self.clara.pk, self.james.pk})
        clara_data = next(member for member in response.data if member["id"] == self.clara.pk)
        self.assertEqual(clara_data["first_name"], "Clara")
        self.assertEqual(clara_data["last_name"], "Bennett")
        self.assertEqual(clara_data["full_name"], "Clara Bennett")
        self.assertEqual(clara_data["gender"], "FEMALE")
        self.assertEqual(clara_data["birth_date"], "1965-04-12")
        self.assertIsNone(clara_data["death_date"])

    # DB-4 / DC-4: A Collaborator can read members from a shared tree.
    def test_db4_dc4_collaborator_lists_members_of_shared_tree(self):
        self.client.force_login(self.collaborator)

        response = self.client.get(self.url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = {member["id"] for member in response.data}
        self.assertEqual(returned_ids, {self.clara.pk, self.james.pk})

    # DB-4 / DC-4: Members from a different tree are not returned.
    def test_db4_dc4_member_list_is_limited_to_selected_tree(self):
        self.client.force_login(self.owner)

        response = self.client.get(self.url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = {member["id"] for member in response.data}
        self.assertNotIn(self.other_member.pk, returned_ids)
        self.assertNotIn(self.private_member.pk, returned_ids)

    # FR-7 / DB-4: An accessible tree with no members returns an empty list.
    def test_fr7_db4_accessible_empty_tree_returns_empty_list(self):
        self.client.force_login(self.owner)
        empty_url = reverse("family-member-list", args=[self.empty_tree.pk])

        response = self.client.get(empty_url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    # DB-4 / DC-4: An outsider cannot read members from a private tree.
    def test_db4_dc4_outsider_cannot_list_private_tree_members(self):
        self.client.force_login(self.outsider)

        response = self.client.get(self.url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # DB-4 / DC-4: Member data is unavailable without an authenticated account.
    def test_db4_dc4_logged_out_user_cannot_list_members(self):
        response = self.client.get(self.url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # DB-4 / DC-4: An unknown parent tree identifier returns not found.
    def test_db4_dc4_unknown_tree_id_returns_not_found(self):
        self.client.force_login(self.owner)
        missing_url = reverse("family-member-list", args=[999999])

        response = self.client.get(missing_url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # SA-1: A Collaborator cannot write member data directly through this endpoint.
    def test_sa1_collaborator_cannot_create_member_through_read_only_endpoint(self):
        self.client.force_login(self.collaborator)

        response = self.client.post(
            self.url,
            {
                "first_name": "Unauthorized",
                "last_name": "Person",
                "gender": "UNKNOWN",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertFalse(
            FamilyMember.objects.filter(
                tree=self.tree,
                first_name="Unauthorized",
                last_name="Person",
            ).exists()
        )


class RelationshipListRequirementTests(APITestCase):
    """SRS tests for listing relationships in one accessible family tree."""

    def setUp(self):
        self.owner = User.objects.create_user(
            "relationship-owner", email="relationship-owner@example.com"
        )
        self.collaborator = User.objects.create_user(
            "relationship-collaborator",
            email="relationship-collaborator@example.com",
        )
        self.outsider = User.objects.create_user(
            "relationship-outsider", email="relationship-outsider@example.com"
        )
        self.tree = FamilyTree.objects.create(
            name="Relationship Family", owner=self.owner
        )
        self.other_tree = FamilyTree.objects.create(
            name="Owner's Other Relationship Family", owner=self.owner
        )
        self.empty_tree = FamilyTree.objects.create(
            name="Empty Relationship Family", owner=self.owner
        )
        self.parent_one = FamilyMember.objects.create(
            tree=self.tree,
            first_name="Clara",
            last_name="Bennett",
        )
        self.parent_two = FamilyMember.objects.create(
            tree=self.tree,
            first_name="James",
            last_name="Bennett",
        )
        self.child = FamilyMember.objects.create(
            tree=self.tree,
            first_name="Charlie",
            last_name="Bennett",
        )
        self.parent_one_relationship = Relationship.objects.create(
            tree=self.tree,
            member1=self.parent_one,
            member2=self.child,
            relationship_type=RelationshipType.PARENT,
        )
        self.parent_two_relationship = Relationship.objects.create(
            tree=self.tree,
            member1=self.parent_two,
            member2=self.child,
            relationship_type=RelationshipType.PARENT,
        )
        self.spouse_relationship = Relationship.objects.create(
            tree=self.tree,
            member1=self.parent_one,
            member2=self.parent_two,
            relationship_type=RelationshipType.SPOUSE,
            start_date=date(1980, 6, 1),
        )
        other_member_one = FamilyMember.objects.create(
            tree=self.other_tree,
            first_name="Other",
            last_name="One",
        )
        other_member_two = FamilyMember.objects.create(
            tree=self.other_tree,
            first_name="Other",
            last_name="Two",
        )
        self.other_relationship = Relationship.objects.create(
            tree=self.other_tree,
            member1=other_member_one,
            member2=other_member_two,
            relationship_type=RelationshipType.SIBLING,
        )
        invitation, _ = Invitation.create_for(self.tree, self.owner)
        TreeCollaborator.objects.create(
            tree=self.tree,
            user=self.collaborator,
            invitation=invitation,
        )
        self.url = reverse("relationship-list", args=[self.tree.pk])

    # FR-5 / FR-7 / IR-3 / IR-7: The Owner receives the selected tree's
    # relationships as JSON, including two separate Parent links to one child.
    def test_fr5_fr7_ir3_ir7_owner_lists_serialized_relationships(self):
        self.client.force_login(self.owner)

        response = self.client.get(self.url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/json")
        returned_ids = {relationship["id"] for relationship in response.data}
        self.assertEqual(
            returned_ids,
            {
                self.parent_one_relationship.pk,
                self.parent_two_relationship.pk,
                self.spouse_relationship.pk,
            },
        )
        parent_links = [
            relationship
            for relationship in response.data
            if relationship["relationship_type"] == RelationshipType.PARENT
        ]
        self.assertEqual(len(parent_links), 2)
        self.assertEqual(
            {relationship["member1"] for relationship in parent_links},
            {self.parent_one.pk, self.parent_two.pk},
        )
        self.assertEqual(
            {relationship["member2"] for relationship in parent_links},
            {self.child.pk},
        )
        spouse_data = next(
            relationship
            for relationship in response.data
            if relationship["id"] == self.spouse_relationship.pk
        )
        self.assertEqual(spouse_data["relationship_type"], RelationshipType.SPOUSE)
        self.assertEqual(spouse_data["start_date"], "1980-06-01")

    # DB-4 / DC-4: A Collaborator can read relationships from a shared tree.
    def test_db4_dc4_collaborator_lists_relationships_of_shared_tree(self):
        self.client.force_login(self.collaborator)

        response = self.client.get(self.url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = {relationship["id"] for relationship in response.data}
        self.assertEqual(
            returned_ids,
            {
                self.parent_one_relationship.pk,
                self.parent_two_relationship.pk,
                self.spouse_relationship.pk,
            },
        )

    # DB-4 / DC-4: Relationships from another tree are not returned.
    def test_db4_dc4_relationship_list_is_limited_to_selected_tree(self):
        self.client.force_login(self.owner)

        response = self.client.get(self.url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = {relationship["id"] for relationship in response.data}
        self.assertNotIn(self.other_relationship.pk, returned_ids)

    # FR-7 / DB-4: An accessible tree with no relationships returns an empty list.
    def test_fr7_db4_accessible_empty_tree_returns_empty_relationship_list(self):
        self.client.force_login(self.owner)
        empty_url = reverse("relationship-list", args=[self.empty_tree.pk])

        response = self.client.get(empty_url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    # DB-4 / DC-4: An outsider cannot read a private tree's relationships.
    def test_db4_dc4_outsider_cannot_list_private_tree_relationships(self):
        self.client.force_login(self.outsider)

        response = self.client.get(self.url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # DB-4 / DC-4: Relationship data is unavailable without authentication.
    def test_db4_dc4_logged_out_user_cannot_list_relationships(self):
        response = self.client.get(self.url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # DB-4 / DC-4: An unknown parent tree identifier returns not found.
    def test_db4_dc4_unknown_tree_id_returns_not_found(self):
        self.client.force_login(self.owner)
        missing_url = reverse("relationship-list", args=[999999])

        response = self.client.get(missing_url, HTTP_ACCEPT="application/json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # SA-1: A Collaborator cannot write relationships directly through this endpoint.
    def test_sa1_collaborator_cannot_create_relationship_through_read_only_endpoint(self):
        self.client.force_login(self.collaborator)
        relationship_count = Relationship.objects.filter(tree=self.tree).count()

        response = self.client.post(
            self.url,
            {
                "member1": self.parent_one.pk,
                "member2": self.child.pk,
                "relationship_type": RelationshipType.ADOPTIVE_PARENT,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertEqual(
            Relationship.objects.filter(tree=self.tree).count(),
            relationship_count,
        )
