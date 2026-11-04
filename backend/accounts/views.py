"""Account endpoints for the React frontend (FR-1, FR-2)."""
from django.contrib.auth import logout
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    """Who is logged in. Frontend calls this on load: 200 = logged in, 403 = show sign-in."""
    user = request.user
    return Response({
        "id": user.pk,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    })


@api_view(["GET"])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf(request):
    """Sets the csrftoken cookie. Frontend sends it back as the X-CSRFToken
    header on every POST/PATCH/PUT/DELETE."""
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Ends the session (FR-2)."""
    logout(request)
    return Response(status=status.HTTP_204_NO_CONTENT)