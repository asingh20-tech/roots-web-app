from django.contrib import admin
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from django.urls import path, include
from django.views.decorators.clickjacking import xframe_options_deny
from trees.views import (FamilyMemberListView,FamilyTreeDetailView,FamilyTreeListCreateView,RelationshipListView,
)


"""
URL configuration for roots project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

@login_required
def profile(request):
    return JsonResponse({
        "message": "You are logged in!",
        "email": request.user.email,
    })

@login_required
@xframe_options_deny
def popup_complete(request):
    return HttpResponse("""
    <script>
      if (window.opener) {
        window.opener.postMessage(
          { type: "GOOGLE_LOGIN_SUCCESS" },
          "http://localhost:5173"
        );
        window.close();
      }
    </script>
    <p>Login complete. You can close this window.</p>
    """)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/accounts/profile/", profile),
    path("accounts/", include("allauth.urls")),
    # Family Tree API
    path("api/trees/", FamilyTreeListCreateView.as_view(), name="family-tree-list-create"),
    path("api/trees/<int:pk>/", FamilyTreeDetailView.as_view(), name="family-tree-detail"),
    path("api/trees/<int:tree_id>/members/", FamilyMemberListView.as_view(), name="family-member-list"),
    path("api/trees/<int:tree_id>/relationships/", RelationshipListView.as_view(), name="relationship-list"),
    #OAuth Popup
    path("accounts/popup-complete/", popup_complete, name="popup-complete"),
]
