"""Tests for the SRS v8 gap work.

FR-23 (proposed): Owner edits tree details and deletes trees.
FR-24 (proposed): Collaborators manage their own pending suggestions.
FR-25 (proposed): approved contributions keep their contributor.
Plus server checks behind the SRS features the frontend now uses:
FR-6/FR-18 uploads, FR-10/FR-19 invitations, FR-15 search, FR-21 outdated.
"""

import shutil
import tempfile
import threading

from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import connections
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase, APITransactionTestCase

from .models import (
    MAX_UPLOAD_BYTES,
    Document,
    FamilyMember,
    FamilyTree,
    Invitation,
    Relationship,
    RelationshipType,
    SuggestionStatus,
    SuggestRequest,
    TreeCollaborator,
)

User = get_user_model()

PDF = b"%PDF-1.4\n%test\n"


def _png_bytes():
    from io import BytesIO

    from PIL import Image

    buffer = BytesIO()
    Image.new("RGB", (4, 4), "#355b43").save(buffer, format="PNG")
    return buffer.getvalue()


PNG = _png_bytes()


def pdf(name="record.pdf", content=PDF):
    return SimpleUploadedFile(name, content, content_type="application/pdf")


class MediaRootMixin:
    """Each test class writes uploads to its own temp folder."""

    @classmethod
    def setUpClass(cls):
        cls._media = tempfile.mkdtemp(prefix="roots-test-media-")
        cls._media_override = override_settings(MEDIA_ROOT=cls._media)
        cls._media_override.enable()
        super().setUpClass()

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        cls._media_override.disable()
        shutil.rmtree(cls._media, ignore_errors=True)


class TreeFixture:
    def make_tree(self):
        self.owner = User.objects.create_user("own", email="own@example.com", first_name="Aditya")
        self.collab = User.objects.create_user("col", email="col@example.com", first_name="Cara")
        self.collab2 = User.objects.create_user("col2", email="col2@example.com", first_name="Dev")
        self.outsider = User.objects.create_user("out", email="out@example.com")
        self.tree = FamilyTree.objects.create(name="Aditya Family", description="Old", owner=self.owner)
        self.other_tree = FamilyTree.objects.create(name="Other Family", owner=self.outsider)
        self.invite, self.raw_token = Invitation.create_for(self.tree, self.owner)
        self.collab_row = TreeCollaborator.objects.create(tree=self.tree, user=self.collab, invitation=self.invite)
        TreeCollaborator.objects.create(tree=self.tree, user=self.collab2, invitation=self.invite)
        self.grandma = FamilyMember.objects.create(tree=self.tree, first_name="Gia", last_name="Singh")
        self.mom = FamilyMember.objects.create(tree=self.tree, first_name="Asha", last_name="Singh")
        Relationship.objects.create(tree=self.tree, member1=self.grandma, member2=self.mom,
                                    relationship_type=RelationshipType.PARENT)
        self.hidden = FamilyMember.objects.create(tree=self.other_tree, first_name="Asha", last_name="Hidden")

    # URLs
    def tree_url(self, tree=None):
        return reverse("family-tree-detail", args=[(tree or self.tree).pk])

    def suggestions_url(self):
        return reverse("suggestion-list", args=[self.tree.pk])

    def suggestion_url(self, s, action=None):
        if action:
            return reverse(f"suggestion-{action}", args=[self.tree.pk, s if isinstance(s, int) else s.pk])
        return reverse("suggestion-detail", args=[self.tree.pk, s if isinstance(s, int) else s.pk])

    def as_user(self, user):
        self.client.force_login(user)

    def propose_member(self, first="Ravi", last="Singh", user=None, note="My uncle"):
        self.as_user(user or self.collab)
        response = self.client.post(self.suggestions_url(), {
            "change_type": "ADD_MEMBER", "description": note,
            "proposed_data": {"first_name": first, "last_name": last},
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        return response.data

    def approve(self, suggestion_id, **body):
        self.as_user(self.owner)
        return self.client.post(self.suggestion_url(suggestion_id, "approve"), body, format="json")


# --------------------------------------------------------------------------
# FR-23 (proposed): edit and delete trees
# --------------------------------------------------------------------------

class TreeManagementTests(MediaRootMixin, TreeFixture, APITestCase):
    def setUp(self):
        self.make_tree()

    def test_owner_edits_name_and_description_and_it_persists(self):
        self.as_user(self.owner)
        response = self.client.patch(self.tree_url(), {"name": "Singh Family", "description": "Since 1890"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual((response.data["name"], response.data["description"]), ("Singh Family", "Since 1890"))
        # A fresh read (what a page refresh does) returns the saved values.
        fresh = self.client.get(self.tree_url()).data
        self.assertEqual((fresh["name"], fresh["description"]), ("Singh Family", "Since 1890"))
        listed = {t["id"]: t["name"] for t in self.client.get(reverse("family-tree-list-create")).data}
        self.assertEqual(listed[self.tree.pk], "Singh Family")

    def test_owner_can_clear_the_description(self):
        self.as_user(self.owner)
        response = self.client.patch(self.tree_url(), {"description": ""}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.tree.refresh_from_db()
        self.assertIn(self.tree.description, ("", None))

    def test_tree_name_is_required_and_at_most_100_characters(self):
        self.as_user(self.owner)
        for bad in ("", "x" * 101):
            response = self.client.patch(self.tree_url(), {"name": bad}, format="json")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn("name", response.data)
        self.tree.refresh_from_db()
        self.assertEqual(self.tree.name, "Aditya Family")

    def test_patch_cannot_change_the_owner(self):
        self.as_user(self.owner)
        self.client.patch(self.tree_url(), {"owner": self.collab.pk, "name": "Kept"}, format="json")
        self.tree.refresh_from_db()
        self.assertEqual(self.tree.owner_id, self.owner.pk)

    def test_collaborator_cannot_patch_or_delete_the_tree(self):
        self.as_user(self.collab)
        self.assertEqual(self.client.patch(self.tree_url(), {"name": "Hacked"}, format="json").status_code,
                         status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.delete(self.tree_url()).status_code, status.HTTP_403_FORBIDDEN)
        self.tree.refresh_from_db()
        self.assertEqual(self.tree.name, "Aditya Family")

    def test_outsider_gets_404_for_read_edit_and_delete(self):
        self.as_user(self.outsider)
        self.assertEqual(self.client.get(self.tree_url()).status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.patch(self.tree_url(), {"name": "x"}, format="json").status_code,
                         status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.delete(self.tree_url()).status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(FamilyTree.objects.filter(pk=self.tree.pk).exists())

    def test_owner_deletes_tree_with_everything_in_it_including_files(self):
        # Fill the tree with every kind of child row and a stored file of each kind.
        self.mom.photo = SimpleUploadedFile("asha.png", PNG, content_type="image/png")
        self.mom.save()
        doc = Document.objects.create(member=self.mom, uploaded_by=self.owner, file=pdf())
        pending = self.propose_member()
        self.as_user(self.collab)
        media = self.client.post(self.suggestions_url(), {
            "change_type": "ADD_MEDIA", "description": "Birth record",
            "target_member": self.mom.pk, "proposed_file": pdf("birth.pdf"),
        }, format="multipart")
        self.assertEqual(media.status_code, status.HTTP_201_CREATED, media.data)
        stored = [self.mom.photo.name, doc.file.name,
                  SuggestRequest.objects.get(pk=media.data["id"]).proposed_file.name]
        for name in stored:
            self.assertTrue(default_storage.exists(name), name)

        self.as_user(self.owner)
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.delete(self.tree_url())
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        tree_id = self.tree.pk
        self.assertFalse(FamilyTree.objects.filter(pk=tree_id).exists())
        self.assertFalse(FamilyMember.objects.filter(tree_id=tree_id).exists())
        self.assertFalse(Relationship.objects.filter(tree_id=tree_id).exists())
        self.assertFalse(SuggestRequest.objects.filter(tree_id=tree_id).exists())
        self.assertFalse(Invitation.objects.filter(tree_id=tree_id).exists())
        self.assertFalse(TreeCollaborator.objects.filter(tree_id=tree_id).exists())
        self.assertFalse(Document.objects.filter(pk=doc.pk).exists())
        self.assertFalse(SuggestRequest.objects.filter(pk=pending["id"]).exists())
        for name in stored:  # DB-6 / DB-7: the physical files are gone too
            self.assertFalse(default_storage.exists(name), name)
        # Other users' data is untouched.
        self.assertTrue(FamilyMember.objects.filter(pk=self.hidden.pk).exists())

        # The deleted tree can't be reopened or listed by anyone.
        self.assertEqual(self.client.get(self.tree_url()).status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.get(reverse("family-member-list", args=[tree_id])).status_code,
                         status.HTTP_404_NOT_FOUND)
        self.assertNotIn(tree_id, [t["id"] for t in self.client.get(reverse("family-tree-list-create")).data])
        self.as_user(self.collab)
        self.assertEqual(self.client.get(self.tree_url()).status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.get(reverse("invitation-accept", args=[self.raw_token])).status_code,
                         status.HTTP_404_NOT_FOUND)


# --------------------------------------------------------------------------
# FR-24 / FR-25 (proposed): My Contributions
# --------------------------------------------------------------------------

class ContributionTests(MediaRootMixin, TreeFixture, APITestCase):
    def setUp(self):
        self.make_tree()

    def my(self, wanted="ALL", user=None):
        self.as_user(user or self.collab)
        response = self.client.get(self.suggestions_url(), {"status": wanted, "page": 1})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data

    def test_collaborator_submits_several_members_and_sees_only_their_own(self):
        ids = [self.propose_member(first)["id"] for first in ("Ravi", "Meera", "Kabir")]
        other = self.propose_member("Zoya", user=self.collab2)["id"]
        page = self.my("PENDING")
        self.assertEqual(page["count"], 3)
        self.assertEqual(sorted(r["id"] for r in page["results"]), sorted(ids))
        self.assertNotIn(other, [r["id"] for r in page["results"]])
        first = page["results"][0]
        self.assertTrue(first["is_mine"])
        self.assertEqual(first["submitted_by"], self.collab.pk)
        self.assertEqual(first["status"], "PENDING")
        # Nothing reached the real tree.
        self.assertFalse(FamilyMember.objects.filter(tree=self.tree, first_name__in=["Ravi", "Meera", "Kabir"]).exists())

    def test_no_arbitrary_limit_and_pages_of_20(self):
        for n in range(23):
            self.propose_member(f"Person{n}")
        first = self.my("PENDING")
        self.assertEqual((first["count"], len(first["results"])), (23, 20))
        self.assertIsNotNone(first["next"])
        second = self.client.get(self.suggestions_url(), {"status": "PENDING", "page": 2}).data
        self.assertEqual(len(second["results"]), 3)

    def test_author_edits_own_pending_member_suggestion(self):
        s = self.propose_member()
        response = self.client.patch(self.suggestion_url(s["id"]), {
            "description": "Actually my great-uncle",
            "proposed_data": {"first_name": "Ravinder", "last_name": "Singh", "birth_date": "1950-01-02"},
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        row = SuggestRequest.objects.get(pk=s["id"])
        self.assertEqual(row.proposed_data["first_name"], "Ravinder")
        self.assertEqual(row.description, "Actually my great-uncle")
        self.assertIsNotNone(row.edited_at)
        self.assertEqual(row.status, SuggestionStatus.PENDING)

    def test_edit_is_validated_like_a_new_submission(self):
        s = self.propose_member()
        response = self.client.patch(self.suggestion_url(s["id"]), {
            "proposed_data": {"first_name": "R", "last_name": "S",
                              "birth_date": "2000-01-01", "death_date": "1990-01-01"},
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response = self.client.patch(self.suggestion_url(s["id"]), {"change_type": "UPDATE_MEMBER"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(SuggestRequest.objects.get(pk=s["id"]).proposed_data["first_name"], "Ravi")

    def test_author_cannot_be_forged(self):
        s = self.propose_member()
        self.client.patch(self.suggestion_url(s["id"]), {"submitted_by": self.collab2.pk,
                                                         "status": "APPROVED"}, format="json")
        row = SuggestRequest.objects.get(pk=s["id"])
        self.assertEqual((row.submitted_by_id, row.status), (self.collab.pk, SuggestionStatus.PENDING))

    def test_cannot_edit_or_withdraw_another_collaborators_suggestion(self):
        s = self.propose_member(user=self.collab2)
        self.as_user(self.collab)
        self.assertEqual(self.client.patch(self.suggestion_url(s["id"]), {"description": "mine now"},
                                           format="json").status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.post(self.suggestion_url(s["id"], "withdraw")).status_code,
                         status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.get(self.suggestion_url(s["id"])).status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(SuggestRequest.objects.get(pk=s["id"]).status, SuggestionStatus.PENDING)

    def test_owner_cannot_edit_or_withdraw_a_collaborators_suggestion(self):
        s = self.propose_member()
        self.as_user(self.owner)
        self.assertEqual(self.client.patch(self.suggestion_url(s["id"]), {"description": "x"},
                                           format="json").status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.post(self.suggestion_url(s["id"], "withdraw")).status_code,
                         status.HTTP_403_FORBIDDEN)

    def test_collaborator_cannot_review(self):
        s = self.propose_member()
        self.as_user(self.collab)
        for action in ("approve", "reject"):
            self.assertEqual(self.client.post(self.suggestion_url(s["id"], action)).status_code,
                             status.HTTP_403_FORBIDDEN)
        self.assertEqual(SuggestRequest.objects.get(pk=s["id"]).status, SuggestionStatus.PENDING)

    def test_withdraw_keeps_an_auditable_row(self):
        s = self.propose_member()
        response = self.client.post(self.suggestion_url(s["id"], "withdraw"))
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data["status"], "WITHDRAWN")
        row = SuggestRequest.objects.get(pk=s["id"])
        self.assertIsNotNone(row.withdrawn_at)
        self.assertEqual([r["id"] for r in self.my("WITHDRAWN")["results"]], [s["id"]])
        # Withdrawn: no longer editable, re-withdrawable or reviewable.
        self.assertEqual(self.client.patch(self.suggestion_url(s["id"]), {"description": "x"},
                                           format="json").status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(self.client.post(self.suggestion_url(s["id"], "withdraw")).status_code,
                         status.HTTP_409_CONFLICT)
        self.assertEqual(self.approve(s["id"]).status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(FamilyMember.objects.filter(first_name="Ravi").exists())

    def test_withdrawing_media_deletes_the_unapproved_file(self):
        self.as_user(self.collab)
        s = self.client.post(self.suggestions_url(), {
            "change_type": "ADD_MEDIA", "description": "Photo", "target_member": self.mom.pk,
            "proposed_file": pdf(),
        }, format="multipart").data
        name = SuggestRequest.objects.get(pk=s["id"]).proposed_file.name
        with self.captureOnCommitCallbacks(execute=True):
            self.client.post(self.suggestion_url(s["id"], "withdraw"))
        self.assertFalse(default_storage.exists(name))

    def test_approved_or_rejected_suggestions_cannot_be_edited_or_withdrawn(self):
        approved = self.propose_member("Ravi")
        rejected = self.propose_member("Meera")
        self.assertEqual(self.approve(approved["id"]).status_code, status.HTTP_200_OK)
        self.client.post(self.suggestion_url(rejected["id"], "reject"))
        self.as_user(self.collab)
        for s in (approved, rejected):
            edit = self.client.patch(self.suggestion_url(s["id"]), {"description": "late edit"}, format="json")
            self.assertEqual(edit.status_code, status.HTTP_409_CONFLICT)
            self.assertEqual(edit.data["code"], "locked")
            self.assertEqual(self.client.post(self.suggestion_url(s["id"], "withdraw")).status_code,
                             status.HTTP_409_CONFLICT)
        self.assertEqual(SuggestRequest.objects.get(pk=approved["id"]).status, SuggestionStatus.APPROVED)
        self.assertEqual(SuggestRequest.objects.get(pk=approved["id"]).description, "My uncle")

    def test_edit_then_approve_applies_the_edited_values(self):
        s = self.propose_member("Ravi")
        self.client.patch(self.suggestion_url(s["id"]),
                          {"proposed_data": {"first_name": "Ravinder", "last_name": "Singh"}}, format="json")
        self.assertEqual(self.approve(s["id"]).status_code, status.HTTP_200_OK)
        self.assertTrue(FamilyMember.objects.filter(tree=self.tree, first_name="Ravinder").exists())
        self.assertFalse(FamilyMember.objects.filter(tree=self.tree, first_name="Ravi").exists())

    def test_approval_records_attribution_and_member_appears_in_tree(self):
        s = self.propose_member()
        response = self.approve(s["id"])
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        member = FamilyMember.objects.get(tree=self.tree, first_name="Ravi")
        self.assertEqual(member.contributed_by_id, self.collab.pk)
        self.assertEqual(member.source_suggestion_id, s["id"])

        self.as_user(self.collab2)
        members = self.client.get(reverse("family-member-list", args=[self.tree.pk])).data
        row = next(m for m in members if m["id"] == member.pk)
        self.assertEqual((row["contributed_by"], row["contributed_by_name"]), (self.collab.pk, "Cara"))
        owner_added = next(m for m in members if m["id"] == self.mom.pk)
        self.assertIsNone(owner_added["contributed_by"])

        approved = self.my("APPROVED")["results"]
        self.assertEqual([(r["id"], r["target_member"]) for r in approved], [(s["id"], member.pk)])
        self.assertEqual(approved[0]["reviewed_by_name"], "Aditya")

    def test_owner_created_members_cannot_fake_attribution(self):
        self.as_user(self.owner)
        response = self.client.post(reverse("family-member-list", args=[self.tree.pk]), {
            "first_name": "New", "last_name": "Kid", "contributed_by": self.collab.pk,
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(FamilyMember.objects.get(pk=response.data["id"]).contributed_by_id)
        self.client.patch(reverse("family-member-detail", args=[self.tree.pk, self.mom.pk]),
                          {"contributed_by": self.collab.pk}, format="json")
        self.mom.refresh_from_db()
        self.assertIsNone(self.mom.contributed_by_id)

    def test_collaborator_proposes_changes_to_their_approved_member(self):
        s = self.propose_member()
        self.approve(s["id"])
        member = FamilyMember.objects.get(first_name="Ravi")
        self.as_user(self.collab)
        # Direct edits are still refused (DB-4, SA-1).
        direct = self.client.patch(reverse("family-member-detail", args=[self.tree.pk, member.pk]),
                                   {"first_name": "Hacked"}, format="json")
        self.assertEqual(direct.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.post(self.suggestions_url(), {
            "change_type": "UPDATE_MEMBER", "description": "Correct spelling",
            "target_member": member.pk, "based_on_version": member.version,
            "proposed_data": {"first_name": "Ravinder"},
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data["original_data"], {"first_name": "Ravi"})
        member.refresh_from_db()
        self.assertEqual(member.first_name, "Ravi")  # unchanged until the Owner approves
        self.assertEqual(self.approve(response.data["id"]).status_code, status.HTTP_200_OK)
        member.refresh_from_db()
        self.assertEqual(member.first_name, "Ravinder")
        self.assertEqual(member.contributed_by_id, self.collab.pk)  # attribution kept

    def test_removed_collaborator_keeps_attribution_but_loses_access(self):
        s = self.propose_member()
        self.approve(s["id"])
        member = FamilyMember.objects.get(first_name="Ravi")
        self.as_user(self.owner)
        remove = self.client.delete(reverse("collaborator-remove", args=[self.tree.pk, self.collab_row.pk]))
        self.assertEqual(remove.status_code, status.HTTP_204_NO_CONTENT)
        member.refresh_from_db()
        self.assertEqual(member.contributed_by_id, self.collab.pk)
        self.as_user(self.collab)
        self.assertEqual(self.client.get(self.tree_url()).status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.get(self.suggestions_url()).status_code, status.HTTP_404_NOT_FOUND)

    def test_deleting_a_contributor_account_keeps_the_member(self):
        s = self.propose_member()
        self.approve(s["id"])
        member = FamilyMember.objects.get(first_name="Ravi")
        self.collab.delete()
        member.refresh_from_db()
        self.assertIsNone(member.contributed_by_id)
        self.assertEqual(member.first_name, "Ravi")


class CommittedTreeDeleteTests(MediaRootMixin, TreeFixture, APITransactionTestCase):
    """DB-6 with a real COMMIT, so PostgreSQL checks the deferred same-tree
    composite FKs too (APITestCase never commits). The tree holds every kind
    of history this work adds: provenance links, approved media, pending
    edits, withdrawn and outdated suggestions."""

    def test_owner_deletes_a_tree_full_of_contribution_history(self):
        self.make_tree()
        approved = self.propose_member("Ravi")
        self.approve(approved["id"])
        ravi = FamilyMember.objects.get(first_name="Ravi")
        self.as_user(self.collab)
        self.client.post(self.suggestions_url(), {
            "change_type": "ADD_MEDIA", "description": "doc", "target_member": ravi.pk,
            "proposed_file": pdf(),
        }, format="multipart")
        media = SuggestRequest.objects.get(change_type="ADD_MEDIA")
        self.approve(media.pk)
        self.as_user(self.collab)
        self.client.post(self.suggestions_url(), {
            "change_type": "UPDATE_MEMBER", "description": "edit", "target_member": ravi.pk,
            "proposed_data": {"first_name": "Ravinder"},
        }, format="json")
        withdrawn = self.propose_member("Gone")
        self.client.post(self.suggestion_url(withdrawn["id"], "withdraw"))
        self.as_user(self.owner)
        self.client.patch(reverse("family-member-detail", args=[self.tree.pk, ravi.pk]),
                          {"last_name": "Kaur"}, format="json")  # makes the edit OUTDATED
        doc_file = Document.objects.get(member=ravi).file.name

        response = self.client.delete(self.tree_url())
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(FamilyTree.objects.filter(pk=self.tree.pk).exists())
        self.assertFalse(SuggestRequest.objects.filter(tree_id=self.tree.pk).exists())
        self.assertFalse(FamilyMember.objects.filter(tree_id=self.tree.pk).exists())
        self.assertFalse(default_storage.exists(doc_file))
        # The contributor's account and other trees are untouched.
        self.assertTrue(User.objects.filter(pk=self.collab.pk).exists())
        self.assertTrue(FamilyTree.objects.filter(pk=self.other_tree.pk).exists())


class ConcurrentReviewTests(APITransactionTestCase):
    """FR-22 / FR-24: an Owner approval and an author's withdrawal of the same
    suggestion at the same moment. Both take a row lock, so exactly one wins
    and the data stays consistent. Real threads with their own connections."""

    def setUp(self):
        self.owner = User.objects.create_user("c-own", email="c-own@example.com")
        self.collab = User.objects.create_user("c-col", email="c-col@example.com")
        self.tree = FamilyTree.objects.create(name="Race", owner=self.owner)
        invite, _ = Invitation.create_for(self.tree, self.owner)
        TreeCollaborator.objects.create(tree=self.tree, user=self.collab, invitation=invite)

    def _run_race(self):
        suggestion = SuggestRequest.objects.create(
            tree=self.tree, submitted_by=self.collab, change_type="ADD_MEMBER", description="race",
            proposed_data={"first_name": "Race", "last_name": "Case"},
        )
        barrier = threading.Barrier(2)
        results = {}

        def call(name, user, url, body):
            client = APIClient()
            client.force_authenticate(user)
            barrier.wait()
            try:
                results[name] = client.post(url, body, format="json").status_code
            finally:
                connections.close_all()

        args = [self.tree.pk, suggestion.pk]
        threads = [
            threading.Thread(target=call, args=("approve", self.owner,
                                                reverse("suggestion-approve", args=args), {})),
            threading.Thread(target=call, args=("withdraw", self.collab,
                                                reverse("suggestion-withdraw", args=args), {})),
        ]
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        suggestion.refresh_from_db()
        return suggestion, results

    def test_approve_and_withdraw_race_has_exactly_one_winner(self):
        for _ in range(3):
            suggestion, results = self._run_race()
            created = FamilyMember.objects.filter(source_suggestion=suggestion).exists()
            if suggestion.status == SuggestionStatus.APPROVED:
                self.assertEqual(results, {"approve": 200, "withdraw": 409})
                self.assertTrue(created)
            else:
                self.assertEqual(suggestion.status, SuggestionStatus.WITHDRAWN)
                self.assertEqual(results, {"approve": 400, "withdraw": 200})
                self.assertFalse(created)


# --------------------------------------------------------------------------
# FR-12 (all four types), FR-6 / FR-18 uploads, FR-21 outdated
# --------------------------------------------------------------------------

class SuggestionTypeAndUploadTests(MediaRootMixin, TreeFixture, APITestCase):
    def setUp(self):
        self.make_tree()

    def submit_media(self, upload, member=None):
        self.as_user(self.collab)
        return self.client.post(self.suggestions_url(), {
            "change_type": "ADD_MEDIA", "description": "A document",
            "target_member": (member or self.mom).pk, "proposed_file": upload,
        }, format="multipart")

    def test_all_four_suggestion_types_can_be_submitted_and_approved(self):
        add = self.propose_member()
        self.as_user(self.collab)
        rel = self.client.post(self.suggestions_url(), {
            "change_type": "ADD_RELATIONSHIP", "description": "siblings",
            "proposed_data": {"member1": self.mom.pk, "member2": self.grandma.pk, "relationship_type": "SPOUSE"},
        }, format="json")
        upd = self.client.post(self.suggestions_url(), {
            "change_type": "UPDATE_MEMBER", "description": "birthday", "target_member": self.mom.pk,
            "proposed_data": {"birth_date": "1970-05-06"},
        }, format="json")
        media = self.submit_media(pdf())
        for response in (rel, upd, media):
            self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        for s in (add["id"], rel.data["id"], upd.data["id"], media.data["id"]):
            self.assertEqual(self.approve(s).status_code, status.HTTP_200_OK, s)
        self.mom.refresh_from_db()
        self.assertEqual(str(self.mom.birth_date), "1970-05-06")
        self.assertTrue(Relationship.objects.filter(relationship_type="SPOUSE", tree=self.tree).exists())
        doc = Document.objects.get(member=self.mom)
        self.assertTrue(default_storage.exists(doc.file.name))
        # The Document owns the file now; the suggestion no longer points at it.
        self.assertFalse(SuggestRequest.objects.get(pk=media.data["id"]).proposed_file)

    def test_invalid_type_fake_signature_and_oversized_uploads_are_rejected(self):
        cases = {
            "wrong extension": SimpleUploadedFile("virus.exe", b"MZ" + b"\x00" * 10),
            "renamed file": SimpleUploadedFile("fake.pdf", b"MZ not a pdf"),
            "too big": SimpleUploadedFile("big.pdf", PDF + b"0" * MAX_UPLOAD_BYTES),
        }
        for label, upload in cases.items():
            response = self.submit_media(upload)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, label)
            self.assertIn("proposed_file", response.data, label)
        self.as_user(self.owner)
        upload = self.client.post(reverse("document-list", args=[self.tree.pk, self.mom.pk]),
                                  {"file": SimpleUploadedFile("x.txt", b"hello")}, format="multipart")
        self.assertEqual(upload.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(SuggestRequest.objects.filter(change_type="ADD_MEDIA").exists())

    def test_pending_file_is_private_to_owner_and_author(self):
        s = self.submit_media(pdf()).data
        file_url = reverse("suggestion-file", args=[self.tree.pk, s["id"]])
        self.assertEqual(self.client.get(file_url).status_code, status.HTTP_200_OK)  # author
        self.as_user(self.owner)
        self.assertEqual(self.client.get(file_url).status_code, status.HTTP_200_OK)
        self.as_user(self.collab2)
        self.assertEqual(self.client.get(file_url).status_code, status.HTTP_404_NOT_FOUND)
        self.as_user(self.outsider)
        self.assertEqual(self.client.get(file_url).status_code, status.HTTP_404_NOT_FOUND)
        self.client.logout()
        self.assertIn(self.client.get(file_url).status_code, (401, 403))

    def test_media_suggestion_is_not_outdated_by_a_name_change(self):
        s = self.submit_media(pdf()).data
        self.mom.first_name = "Renamed"
        self.mom.save()
        self.assertEqual(SuggestRequest.objects.get(pk=s["id"]).status, SuggestionStatus.PENDING)
        self.assertEqual(self.approve(s["id"]).status_code, status.HTTP_200_OK)

    def test_outdated_update_shows_original_current_and_proposed_and_never_overwrites(self):
        self.as_user(self.collab)
        upd = self.client.post(self.suggestions_url(), {
            "change_type": "UPDATE_MEMBER", "description": "spelling", "target_member": self.mom.pk,
            "based_on_version": self.mom.version, "proposed_data": {"first_name": "Aasha"},
        }, format="json").data
        self.as_user(self.owner)
        self.client.patch(reverse("family-member-detail", args=[self.tree.pk, self.mom.pk]),
                          {"first_name": "Asha Rani"}, format="json")
        row = self.client.get(self.suggestion_url(upd["id"])).data
        self.assertEqual(row["status"], "OUTDATED")
        self.assertEqual(row["comparison"]["first_name"],
                         {"original": "Asha", "current": "Asha Rani", "proposed": "Aasha"})
        conflict = self.approve(upd["id"])
        self.assertEqual(conflict.status_code, status.HTTP_409_CONFLICT)
        self.mom.refresh_from_db()
        self.assertEqual(self.mom.first_name, "Asha Rani")  # newer value kept
        # The author can no longer edit an outdated suggestion.
        self.as_user(self.collab)
        self.assertEqual(self.client.patch(self.suggestion_url(upd["id"]), {"description": "x"},
                                           format="json").status_code, status.HTTP_409_CONFLICT)
        # Only an explicit Owner confirmation applies it.
        self.assertEqual(self.approve(upd["id"], confirm_outdated=True).status_code, status.HTTP_200_OK)
        self.mom.refresh_from_db()
        self.assertEqual(self.mom.first_name, "Aasha")

    def test_update_from_a_stale_form_is_refused(self):
        seen = self.mom.version
        self.mom.last_name = "Kaur"
        self.mom.save()
        self.as_user(self.collab)
        response = self.client.post(self.suggestions_url(), {
            "change_type": "UPDATE_MEMBER", "description": "x", "target_member": self.mom.pk,
            "based_on_version": seen, "proposed_data": {"first_name": "Aasha"},
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("based_on_version", response.data)

    def test_update_with_no_real_change_is_refused(self):
        self.as_user(self.collab)
        response = self.client.post(self.suggestions_url(), {
            "change_type": "UPDATE_MEMBER", "description": "x", "target_member": self.mom.pk,
            "proposed_data": {"first_name": "Asha"},
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_owner_photo_and_document_uploads_and_collaborator_is_refused(self):
        photo_url = reverse("member-photo", args=[self.tree.pk, self.mom.pk])
        docs_url = reverse("document-list", args=[self.tree.pk, self.mom.pk])
        self.as_user(self.collab)
        self.assertEqual(self.client.put(photo_url, {"photo": SimpleUploadedFile("a.png", PNG)},
                                         format="multipart").status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.post(docs_url, {"file": pdf()}, format="multipart").status_code,
                         status.HTTP_403_FORBIDDEN)
        self.as_user(self.owner)
        put = self.client.put(photo_url, {"photo": SimpleUploadedFile("a.png", PNG)}, format="multipart")
        self.assertEqual(put.status_code, status.HTTP_200_OK, put.data)
        self.assertEqual(self.client.get(photo_url).status_code, status.HTTP_200_OK)
        doc = self.client.post(docs_url, {"file": pdf()}, format="multipart")
        self.assertEqual(doc.status_code, status.HTTP_201_CREATED, doc.data)
        doc_url = reverse("document-detail", args=[self.tree.pk, self.mom.pk, doc.data["id"]])
        self.as_user(self.collab)
        self.assertEqual(self.client.delete(doc_url).status_code, status.HTTP_403_FORBIDDEN)
        self.as_user(self.owner)
        self.assertEqual(self.client.delete(doc_url).status_code, status.HTTP_204_NO_CONTENT)


# --------------------------------------------------------------------------
# FR-10 / FR-11 / FR-19 invitations, FR-15 search
# --------------------------------------------------------------------------

class InvitationAndSearchTests(TreeFixture, APITestCase):
    def setUp(self):
        self.make_tree()

    def test_owner_lists_and_revokes_links_and_revoked_link_stops_working(self):
        self.as_user(self.owner)
        listing = self.client.get(reverse("invitation-list", args=[self.tree.pk])).data
        self.assertEqual([(i["id"], i["is_valid"], i["collaborator_count"]) for i in listing],
                         [(self.invite.pk, True, 2)])
        self.assertNotIn("url", listing[0])  # the raw token is never listed (SA-2)
        revoke = self.client.delete(reverse("invitation-revoke", args=[self.tree.pk, self.invite.pk]))
        self.assertEqual(revoke.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(self.client.get(reverse("invitation-list", args=[self.tree.pk])).data[0]["is_valid"])
        self.as_user(self.outsider)
        accept = self.client.post(reverse("invitation-accept", args=[self.raw_token]))
        self.assertEqual(accept.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(self.tree.can_view(self.outsider))
        # People who already joined keep access (revoking stops new joins only).
        self.assertTrue(self.tree.can_view(self.collab))

    def test_one_link_works_for_several_people_until_revoked(self):
        self.as_user(self.owner)
        created = self.client.post(reverse("invitation-list", args=[self.tree.pk])).data
        token = created["url"].rsplit("/", 1)[-1]
        for n in range(3):
            user = User.objects.create_user(f"joiner{n}", email=f"joiner{n}@example.com")
            self.as_user(user)
            self.assertEqual(self.client.post(reverse("invitation-accept", args=[token])).status_code,
                             status.HTTP_201_CREATED)

    def test_collaborators_cannot_manage_invitations(self):
        self.as_user(self.collab)
        self.assertEqual(self.client.get(reverse("invitation-list", args=[self.tree.pk])).status_code,
                         status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.post(reverse("invitation-list", args=[self.tree.pk])).status_code,
                         status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.delete(reverse("invitation-revoke", args=[self.tree.pk, self.invite.pk]))
                         .status_code, status.HTTP_403_FORBIDDEN)
        self.invite.refresh_from_db()
        self.assertTrue(self.invite.is_valid)

    def test_search_is_partial_case_insensitive_and_only_authorized(self):
        self.as_user(self.collab)
        results = self.client.get(reverse("member-search"), {"q": "aSh", "tree": self.tree.pk}).data
        self.assertEqual([r["id"] for r in results], [self.mom.pk])
        everywhere = self.client.get(reverse("member-search"), {"q": "asha"}).data
        self.assertNotIn(self.hidden.pk, [r["id"] for r in everywhere])
        # Asking for a tree you can't see returns nothing, not its members.
        other = self.client.get(reverse("member-search"), {"q": "asha", "tree": self.other_tree.pk}).data
        self.assertEqual(other, [])
        by_last = self.client.get(reverse("member-search"), {"q": "SINGH", "tree": self.tree.pk}).data
        self.assertEqual({r["id"] for r in by_last}, {self.mom.pk, self.grandma.pk})
