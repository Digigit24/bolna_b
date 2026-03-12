"""
Webhook endpoint for Bolna AI callbacks.

POST /api/webhooks/bolna/

Bolna sends the full execution object to this endpoint when call
status changes (initiated, ringing, in-progress, completed, failed, etc.).
The 'completed' status is the terminal success state and arrives after
recordings and extraction are done (typically 2-3 min after disconnect).

Webhook payload key fields:
  - id               → execution ID (our bolna_call_id)
  - status           → completed, failed, no-answer, busy, canceled, etc.
  - conversation_time → duration in seconds
  - transcript       → full call transcript
  - telephony_data   → {recording_url, duration, hangup_by, ...}
  - extracted_data   → structured data from extraction prompts
  - total_cost       → cost in cents
"""

import logging

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from calls.models import CandidateCall
from calls.tasks import process_transcript_task
from services.bolna_service import BolnaService

logger = logging.getLogger("webhooks")

# Bolna statuses that indicate a failed/unanswered call
FAILED_STATUSES = {"failed", "no-answer", "busy", "canceled", "stopped", "error", "balance-low"}
# Statuses that mean the call is still in progress
IN_PROGRESS_STATUSES = {"initiated", "ringing", "in-progress", "queued"}


class BolnaWebhookView(APIView):
    """
    POST /api/webhooks/bolna/

    Receives Bolna AI webhook payloads. No auth required (Bolna calls
    this URL directly). In production, verify via shared secret header.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.data

        if not payload:
            return Response(
                {"error": "Empty payload"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Normalize through the service layer
        service = BolnaService()
        normalized = service.handle_webhook(payload)

        execution_id = normalized.get("execution_id")
        if not execution_id:
            logger.warning("Webhook missing execution id: %s", payload)
            return Response(
                {"error": "Missing execution id in webhook payload"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Find the matching CandidateCall
        try:
            call = CandidateCall.objects.get(bolna_call_id=execution_id)
        except CandidateCall.DoesNotExist:
            logger.warning("Webhook for unknown execution_id: %s", execution_id)
            return Response(
                {"error": "Unknown execution_id"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Map Bolna status to our internal status
        webhook_status = normalized.get("status", "")

        if webhook_status == "completed":
            call.status = CandidateCall.Status.COMPLETED
        elif webhook_status in FAILED_STATUSES:
            call.status = CandidateCall.Status.FAILED
            call.error_message = normalized.get("error_message") or f"Call {webhook_status}"
        elif webhook_status in IN_PROGRESS_STATUSES:
            call.status = CandidateCall.Status.CALLING

        call.duration = normalized.get("duration", call.duration)
        call.save(update_fields=["status", "duration", "error_message", "updated_at"])

        logger.info(
            "Webhook processed: execution_id=%s bolna_status=%s internal_status=%s",
            execution_id,
            webhook_status,
            call.status,
        )

        # On completed: trigger async transcript processing → AI summary
        if call.status == CandidateCall.Status.COMPLETED:
            process_transcript_task.delay(
                call_id=str(call.id),
                transcript=normalized.get("transcript", ""),
                recording_url=normalized.get("recording_url", ""),
            )

        return Response({"status": "ok"})
