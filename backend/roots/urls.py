"""URL routes for Roots. All frontend-backend traffic goes through /api/ (IR-7)."""
from django.conf import settings
from django.contrib import admin
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.urls import include, path
from django.views.decorators.clickjacking import xframe_options_deny

from accounts.views import csrf, logout_view, me
from trees.views import (
    CollaboratorListView,
    CollaboratorRemoveView,
    DocumentDetailView,
    DocumentFileView,
    DocumentListCreateView,
    FamilyMemberDetailView,
    FamilyMemberListCreateView,
    FamilyTreeDetailView,
    FamilyTreeListCreateView,
    InvitationAcceptView,
    InvitationListCreateView,
    InvitationRevokeView,
    MemberPhotoView,
    MemberSearchView,
    RelationshipDetailView,
    RelationshipListCreateView,
    SuggestionApproveView,
    SuggestionDetailView,
    SuggestionFileView,
    SuggestionListCreateView,
    SuggestionRejectView,
)


@login_required
@xframe_options_deny
def popup_complete(request):
    """Last page of the Google login popup: tells the React window login worked, then closes."""
    frontend = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    return HttpResponse("""
    <script>
      if (window.opener) {
        window.opener.postMessage(
          { type: "GOOGLE_LOGIN_SUCCESS" },
          "http://localhost:5173"
        );
      }
      window.close();
    </script>
    <p>Login complete. You can close this window.</p>
    """)


urlpatterns = [
    path("admin/", admin.site.urls),
    # OAuth popup (must be above the allauth include)
    path("accounts/popup-complete/", popup_complete, name="popup-complete"),
    path("accounts/", include("allauth.urls")),  # Google login (FR-1)

    # Auth API
    path("api/me/", me, name="me"),
    path("api/accounts/profile/", me),  # TEMP: old path the frontend still calls; remove once it uses /api/me/
    path("api/csrf/", csrf, name="csrf"),
    path("api/logout/", logout_view, name="logout"),

    # Trees (FR-3, DB-6)
    path("api/trees/", FamilyTreeListCreateView.as_view(), name="family-tree-list-create"),
    path("api/trees/<int:pk>/", FamilyTreeDetailView.as_view(), name="family-tree-detail"),

    # Members (FR-4, FR-9)
    path("api/trees/<int:tree_id>/members/", FamilyMemberListCreateView.as_view(), name="family-member-list"),
    path("api/trees/<int:tree_id>/members/<int:pk>/", FamilyMemberDetailView.as_view(), name="family-member-detail"),

    # Relationships (FR-5)
    path("api/trees/<int:tree_id>/relationships/", RelationshipListCreateView.as_view(), name="relationship-list"),
    path("api/trees/<int:tree_id>/relationships/<int:pk>/", RelationshipDetailView.as_view(), name="relationship-detail"),

    # Photos and documents, served only to Owner/Collaborators (FR-6, FR-9, FR-18, DB-7)
    path("api/trees/<int:tree_id>/members/<int:pk>/photo/", MemberPhotoView.as_view(), name="member-photo"),
    path("api/trees/<int:tree_id>/members/<int:member_id>/documents/", DocumentListCreateView.as_view(), name="document-list"),
    path("api/trees/<int:tree_id>/members/<int:member_id>/documents/<int:pk>/", DocumentDetailView.as_view(), name="document-detail"),
    path("api/trees/<int:tree_id>/members/<int:member_id>/documents/<int:pk>/file/", DocumentFileView.as_view(), name="document-file"),

    # Search (FR-15)
    path("api/search/", MemberSearchView.as_view(), name="member-search"),

    # Invitations and collaborators (FR-10, FR-11, FR-19)
    path("api/trees/<int:tree_id>/invitations/", InvitationListCreateView.as_view(), name="invitation-list"),
    path("api/trees/<int:tree_id>/invitations/<int:pk>/", InvitationRevokeView.as_view(), name="invitation-revoke"),
    path("api/invite/<str:token>/", InvitationAcceptView.as_view(), name="invitation-accept"),
    path("api/trees/<int:tree_id>/collaborators/", CollaboratorListView.as_view(), name="collaborator-list"),
    path("api/trees/<int:tree_id>/collaborators/<int:pk>/", CollaboratorRemoveView.as_view(), name="collaborator-remove"),

    # Suggestions (FR-12, FR-13, FR-14, FR-21)
    path("api/trees/<int:tree_id>/suggestions/", SuggestionListCreateView.as_view(), name="suggestion-list"),
    path("api/trees/<int:tree_id>/suggestions/<int:pk>/", SuggestionDetailView.as_view(), name="suggestion-detail"),
    path("api/trees/<int:tree_id>/suggestions/<int:pk>/file/", SuggestionFileView.as_view(), name="suggestion-file"),
    path("api/trees/<int:tree_id>/suggestions/<int:pk>/approve/", SuggestionApproveView.as_view(), name="suggestion-approve"),
    path("api/trees/<int:tree_id>/suggestions/<int:pk>/reject/", SuggestionRejectView.as_view(), name="suggestion-reject"),

   
]