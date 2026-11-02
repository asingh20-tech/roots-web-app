"""URL routes for Roots. All frontend-backend traffic goes through /api/ (IR-7)."""
from django.conf import settings
from django.contrib import admin
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.urls import include, path
from django.views.decorators.clickjacking import xframe_options_deny

from accounts.views import csrf, logout_view, me
from trees.views import (
    FamilyMemberDetailView,
    FamilyMemberListCreateView,
    FamilyTreeDetailView,
    FamilyTreeListCreateView,
    RelationshipDetailView,
    RelationshipListCreateView,
)


@login_required
@xframe_options_deny
def popup_complete(request):
    """Last page of the Google login popup: tells the React window login worked, then closes."""
    frontend = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    return HttpResponse(f"""
    <script>
      if (window.opener) {{
        window.opener.postMessage({{ type: "GOOGLE_LOGIN_SUCCESS" }}, "{frontend}");
        window.close();
      }}
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
]