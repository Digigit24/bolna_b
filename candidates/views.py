"""
CRUD API views for candidates, scoped to the user's organization.
"""

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from candidates.models import Candidate
from candidates.serializers import CandidateBulkCreateSerializer, CandidateSerializer
from users.permissions import IsRecruiterOrAdmin


class CandidateListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/candidates/      — list candidates (filterable by job, status)
    POST /api/candidates/      — add a single candidate
    """

    serializer_class = CandidateSerializer
    permission_classes = [IsRecruiterOrAdmin]
    filterset_fields = ["job", "status"]
    search_fields = ["name", "email", "phone"]
    ordering_fields = ["created_at", "name", "experience_years"]

    def get_queryset(self):
        return Candidate.objects.filter(organization=self.request.organization)

    def perform_create(self, serializer):
        serializer.save(organization=self.request.organization)


class CandidateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/candidates/<id>/
    PUT    /api/candidates/<id>/
    DELETE /api/candidates/<id>/
    """

    serializer_class = CandidateSerializer
    permission_classes = [IsRecruiterOrAdmin]
    lookup_field = "pk"

    def get_queryset(self):
        return Candidate.objects.filter(organization=self.request.organization)


class CandidateBulkCreateView(APIView):
    """POST /api/candidates/bulk/ — import multiple candidates at once."""

    permission_classes = [IsRecruiterOrAdmin]

    def post(self, request):
        serializer = CandidateBulkCreateSerializer(
            data=request.data,
            context={"organization": request.organization},
        )
        serializer.is_valid(raise_exception=True)
        created = serializer.save()
        return Response(
            {"created": len(created)},
            status=status.HTTP_201_CREATED,
        )
