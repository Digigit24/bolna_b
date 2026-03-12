"""CRUD API views for interviews, scoped to the user's organization."""

from rest_framework import generics

from interviews.models import Interview
from interviews.serializers import InterviewSerializer
from users.permissions import IsRecruiterOrAdmin


class InterviewListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/interviews/"""

    serializer_class = InterviewSerializer
    permission_classes = [IsRecruiterOrAdmin]
    filterset_fields = ["candidate", "status", "interview_type"]
    ordering_fields = ["scheduled_at", "created_at"]

    def get_queryset(self):
        return Interview.objects.filter(
            candidate__organization=self.request.organization,
        ).select_related("candidate", "job", "interviewer")


class InterviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/DELETE /api/interviews/<id>/"""

    serializer_class = InterviewSerializer
    permission_classes = [IsRecruiterOrAdmin]
    lookup_field = "pk"

    def get_queryset(self):
        return Interview.objects.filter(
            candidate__organization=self.request.organization,
        )
