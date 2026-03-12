"""
Webhook endpoint for Bolna AI callbacks.

POST /api/webhooks/bolna/

When Bolna calls this endpoint after a call completes (or fails),
we update the CandidateCall record and trigger async transcript
processing and AI summary generation.
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


class BolnaWebhookView(APIView):
    """
    POST /api/webhooks/bolna/

    Accepts webhook payloads from Bolna AI.  No authentication is
    required (Bolna calls this URL directly), but in production you
    should verify the webhook signature or shared secret.

    Expected payload fields (at minimum):
        - call_id        (str)  — matches CandidateCall.bolna_call_id
        - status         (str)  — "completed", "failed", etc.
        - duration       (int)  — seconds
        - transcript     (str)  — full call transcript
        - recording_url  (str)  — URL to the recording file
    """

    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.data

        if not payload:
            return Response(
                {"error": "Empty payload"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Normalize the webhook data through the service layer
        service = BolnaService()
        normalized = service.handle_webhook(payload)

        bolna_call_id = normalized.get("call_id")
        if not bolna_call_id:
            logger.warning("Webhook missing call_id: %s", payload)
            return Response(
                {"error": "Missing call_id in webhook payload"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Find the matching CandidateCall
        try:
            call = CandidateCall.objects.get(bolna_call_id=bolna_call_id)
        except CandidateCall.DoesNotExist:
            logger.warning("Webhook for unknown call_id: %s", bolna_call_id)
            return Response(
                {"error": "Unknown call_id"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Update call fields from the webhook
        webhook_status = normalized.get("status", "")
        if webhook_status == "completed":
            call.status = CandidateCall.Status.COMPLETED
        elif webhook_status == "failed":
            call.status = CandidateCall.Status.FAILED
            call.error_message = payload.get("error", "Call failed via webhook")

        call.duration = normalized.get("duration", call.duration)
        call.save(update_fields=["status", "duration", "error_message", "updated_at"])

        logger.info(
            "Webhook processed: bolna_call_id=%s status=%s",
            bolna_call_id,
            call.status,
        )

        # If the call completed, trigger async transcript processing
        if call.status == CandidateCall.Status.COMPLETED:
            process_transcript_task.delay(
                call_id=str(call.id),
                transcript=normalized.get("transcript", ""),
                recording_url=normalized.get("recording_url", ""),
            )

        return Response({"status": "ok"})
