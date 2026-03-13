"""
API views for managing calls.

- List / retrieve call logs
- Trigger a new call (queues a Celery task)
- View transcript and AI summary
"""

import logging

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from calls.models import CandidateCall
from calls.serializers import CandidateCallSerializer, StartCallSerializer
from calls.tasks import initiate_call_task
from candidates.models import Candidate
from users.permissions import IsRecruiterOrAdmin

logger = logging.getLogger("calls")


class CallListView(generics.ListAPIView):
    """
    GET /api/calls/ — list all calls for the current organization.

    Supports filtering by candidate and status.
    """

    serializer_class = CandidateCallSerializer
    permission_classes = [IsRecruiterOrAdmin]
    filterset_fields = ["candidate", "status"]
    ordering_fields = ["created_at", "status"]

    def get_queryset(self):
        return CandidateCall.objects.filter(
            candidate__organization=self.request.organization,
        ).select_related("candidate")


class CallDetailView(generics.RetrieveAPIView):
    """GET /api/calls/<id>/ — retrieve a single call with transcript & summary."""

    serializer_class = CandidateCallSerializer
    permission_classes = [IsRecruiterOrAdmin]
    lookup_field = "pk"

    def get_queryset(self):
        return CandidateCall.objects.filter(
            candidate__organization=self.request.organization,
        ).select_related("candidate")


class StartCallView(APIView):
    """
    POST /api/calls/start/ — initiate a call to a candidate.

    Creates a CandidateCall record with status=queued and dispatches
    the ``initiate_call_task`` Celery task.
    """

    permission_classes = [IsRecruiterOrAdmin]

    def post(self, request):
        serializer = StartCallSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        candidate_id = serializer.validated_data["candidate_id"]
        agent_config = serializer.validated_data.get("agent_config", {})

        # Ensure candidate belongs to the user's organization
        try:
            candidate = Candidate.objects.get(
                pk=candidate_id,
                organization=request.organization,
            )
        except Candidate.DoesNotExist:
            return Response(
                {"error": "Candidate not found in your organization"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Create the call record
        call = CandidateCall.objects.create(
            candidate=candidate,
            agent_config=agent_config,
            status=CandidateCall.Status.QUEUED,
        )

        # Dispatch async task — gracefully handle broker unavailability
        try:
            initiate_call_task.delay(str(call.id))
        except Exception as exc:
            logger.error(
                "Failed to dispatch call task (broker down?): %s", exc,
            )
            call.status = CandidateCall.Status.FAILED
            call.error_message = "Task broker unavailable. Please try again later."
            call.save(update_fields=["status", "error_message"])
            return Response(
                CandidateCallSerializer(call).data,
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        logger.info(
            "Call queued: call_id=%s candidate=%s",
            call.id,
            candidate.name,
        )

        return Response(
            CandidateCallSerializer(call).data,
            status=status.HTTP_201_CREATED,
        )


class CallTranscriptView(generics.RetrieveAPIView):
    """GET /api/calls/<id>/transcript/ — return just the transcript and summary."""

    permission_classes = [IsRecruiterOrAdmin]
    lookup_field = "pk"

    def get_queryset(self):
        return CandidateCall.objects.filter(
            candidate__organization=self.request.organization,
        ).select_related("candidate")

    def retrieve(self, request, *args, **kwargs):
        call = self.get_object()
        return Response({
            "call_id": str(call.id),
            "candidate_name": call.candidate.name,
            "transcript": call.transcript,
            "ai_score": call.ai_score,
            "summary": call.summary,
            "recording_url": call.recording_url,
            "status": call.status,
            "duration": call.duration,
        })
