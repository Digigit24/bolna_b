"""
Root URL configuration for bolna_backend — HR AI Calling SaaS.

All API endpoints are under /api/ and organized by app.
"""

from django.contrib import admin
from django.urls import include, path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """GET /api/health/ — simple liveness probe."""
    return Response({"status": "ok"})


urlpatterns = [
    # Django admin
    path("admin/", admin.site.urls),

    # Health check
    path("api/health/", health_check, name="health-check"),

    # App endpoints
    path("api/users/", include("users.urls")),
    path("api/organizations/", include("organizations.urls")),
    path("api/jobs/", include("jobs.urls")),
    path("api/candidates/", include("candidates.urls")),
    path("api/calls/", include("calls.urls")),
    path("api/interviews/", include("interviews.urls")),
    path("api/analytics/", include("analytics.urls")),
    path("api/webhooks/", include("webhooks.urls")),
]
