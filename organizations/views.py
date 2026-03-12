"""
API views for organization management.
"""

from rest_framework import generics

from organizations.models import Organization
from organizations.serializers import OrganizationSerializer
from users.permissions import IsAdmin


class OrganizationListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/organizations/"""

    serializer_class = OrganizationSerializer
    permission_classes = [IsAdmin]
    queryset = Organization.objects.all()


class OrganizationDetailView(generics.RetrieveUpdateAPIView):
    """GET/PUT /api/organizations/<id>/"""

    serializer_class = OrganizationSerializer
    permission_classes = [IsAdmin]
    queryset = Organization.objects.all()
    lookup_field = "pk"
