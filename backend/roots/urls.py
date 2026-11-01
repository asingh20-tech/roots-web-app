
from django.contrib import admin
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.urls import path, include

from trees.views import (
    FamilyTreeListCreateView,
    FamilyTreeDetailView,
    FamilyMemberListView,
    RelationshipListView,
)


@login_required
def profile(request):
    return JsonResponse({
        "message": "You are logged in!",
        "email": request.user.email,
    })


urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/profile/", profile),
    path("accounts/", include("allauth.urls")),

    # Family Tree API
    path(
        "api/trees/",
        FamilyTreeListCreateView.as_view(),
        name="family-tree-list-create",
    ),

    path(
        "api/trees/<int:pk>/",
        FamilyTreeDetailView.as_view(),
        name="family-tree-detail",
    ),

    path(
        "api/trees/<int:tree_id>/members/",
        FamilyMemberListView.as_view(),
        name="family-member-list",
    ),

    path(
        "api/trees/<int:tree_id>/relationships/",
        RelationshipListView.as_view(),
        name="relationship-list",
    ),
]
