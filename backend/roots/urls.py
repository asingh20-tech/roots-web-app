from django.contrib import admin
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.urls import path, include


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


urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/profile/", profile),
    path("accounts/", include("allauth.urls")),
]