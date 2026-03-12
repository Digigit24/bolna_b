"""
CRUD API views for job postings, scoped to the user's organization.
"""

from rest_framework import generics

from jobs.models import Job
from jobs.serializers import JobSerializer
from users.permissions import IsRecruiterOrAdmin


class JobListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/jobs/      — list jobs for the current organization
    POST /api/jobs/      — create a new job posting
    """

    serializer_class = JobSerializer
    permission_classes = [IsRecruiterOrAdmin]
    filterset_fields = ["status"]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "title"]

    def get_queryset(self):
        # Multi-tenant isolation: only show jobs for the user's org
        return Job.objects.filter(organization=self.request.organization)

    def perform_create(self, serializer):
        serializer.save(
            organization=self.request.organization,
            created_by=self.request.user,
        )


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/jobs/<id>/  — retrieve a job
    PUT    /api/jobs/<id>/  — update a job
    DELETE /api/jobs/<id>/  — delete a job
    """

    serializer_class = JobSerializer
    permission_classes = [IsRecruiterOrAdmin]
    lookup_field = "pk"

    def get_queryset(self):
        return Job.objects.filter(organization=self.request.organization)
