"""
Celery tasks for asynchronous call processing.

Tasks:
  - initiate_call_task:     Place a call via BolnaService (with retry logic)
  - process_transcript_task: Save transcript & recording after a call completes
  - generate_ai_summary_task: Score the candidate and write an AI summary

All tasks are idempotent — safe to retry without side-effects.
"""

import logging

from celery import shared_task
from django.utils import timezone

logger = logging.getLogger("calls")

# ---------------------------------------------------------------------------
# Retry schedule:  immediate → 2 hours → 24 hours  (3 attempts total)
# ---------------------------------------------------------------------------
RETRY_DELAYS = [0, 7200, 86400]  # seconds


@shared_task(
    bind=True,
    max_retries=2,
    acks_late=True,
    name="calls.initiate_call",
)
def initiate_call_task(self, call_id: str):
    """
    Place a call to a candidate through Bolna AI.

    Idempotent: if the call already has a bolna_call_id, we skip re-initiating.
    On failure, retries according to RETRY_DELAYS.
    """
    from calls.models import CandidateCall
    from services.bolna_service import BolnaService

    try:
        call = CandidateCall.objects.select_related("candidate").get(pk=call_id)
    except CandidateCall.DoesNotExist:
        logger.error("initiate_call_task: CandidateCall %s not found", call_id)
        return

    # Idempotency guard — don't re-initiate an already started call
    if call.bolna_call_id and call.status != CandidateCall.Status.FAILED:
        logger.info("Call %s already initiated (bolna_call_id=%s)", call_id, call.bolna_call_id)
        return

    call.status = CandidateCall.Status.CALLING
    call.save(update_fields=["status", "updated_at"])

    service = BolnaService()
    try:
        result = service.start_call(
            phone=call.candidate.phone,
            agent_config=call.agent_config,
        )
        call.bolna_call_id = result.get("call_id", "")
        call.status = CandidateCall.Status.CALLING
        call.save(update_fields=["bolna_call_id", "status", "updated_at"])
        logger.info(
            "Call initiated: call_id=%s bolna_call_id=%s",
            call_id,
            call.bolna_call_id,
        )
    except Exception as exc:
        call.retry_count += 1
        call.error_message = str(exc)
        # Next retry index: current attempt (0-based) + 1
        next_retry = self.request.retries + 1

        if self.request.retries < self.max_retries:
            next_delay = RETRY_DELAYS[min(next_retry, len(RETRY_DELAYS) - 1)]
            call.status = CandidateCall.Status.QUEUED
            call.save(update_fields=["retry_count", "error_message", "status", "updated_at"])
            logger.warning(
                "Call %s failed (attempt %d), retrying in %ds: %s",
                call_id,
                next_retry,
                next_delay,
                exc,
            )
            raise self.retry(exc=exc, countdown=next_delay)
        else:
            call.status = CandidateCall.Status.FAILED
            call.save(update_fields=["retry_count", "error_message", "status", "updated_at"])
            logger.error(
                "Call %s permanently failed after %d retries: %s",
                call_id,
                call.retry_count,
                exc,
            )


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    acks_late=True,
    name="calls.process_transcript",
)
def process_transcript_task(self, call_id: str, transcript: str = "", recording_url: str = ""):
    """
    Persist the transcript and recording URL for a completed call.

    Idempotent: overwrites existing transcript/recording_url values.
    Triggers the AI summary task upon success.
    """
    from calls.models import CandidateCall

    try:
        call = CandidateCall.objects.get(pk=call_id)
    except CandidateCall.DoesNotExist:
        logger.error("process_transcript_task: CandidateCall %s not found", call_id)
        return

    call.transcript = transcript
    call.recording_url = recording_url
    call.status = CandidateCall.Status.COMPLETED
    call.save(update_fields=["transcript", "recording_url", "status", "updated_at"])

    logger.info("Transcript saved for call %s (%d chars)", call_id, len(transcript))

    # Chain: generate AI summary after transcript is stored
    generate_ai_summary_task.delay(str(call_id))


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=120,
    acks_late=True,
    name="calls.generate_ai_summary",
)
def generate_ai_summary_task(self, call_id: str):
    """
    Analyze the call transcript and produce:
      - ai_score  (0–100 float)
      - summary   (text paragraph)

    Idempotent: overwrites existing ai_score/summary values.

    NOTE: This is a placeholder implementation. Replace the scoring
    logic with your actual AI/LLM integration (e.g. OpenAI, Claude, etc.).
    """
    from calls.models import CandidateCall

    try:
        call = CandidateCall.objects.get(pk=call_id)
    except CandidateCall.DoesNotExist:
        logger.error("generate_ai_summary_task: CandidateCall %s not found", call_id)
        return

    if not call.transcript:
        logger.warning("No transcript for call %s — skipping AI summary", call_id)
        return

    try:
        # ------------------------------------------------------------------
        # TODO: Replace this placeholder with a real AI/LLM call.
        # Example: send call.transcript to OpenAI / Claude and parse the
        # returned score + summary.
        # ------------------------------------------------------------------
        word_count = len(call.transcript.split())
        call.ai_score = min(100.0, round(word_count * 0.5, 1))
        call.summary = (
            f"AI analysis of call with {call.candidate.name}: "
            f"The transcript contains {word_count} words. "
            f"Candidate score: {call.ai_score}/100."
        )
        call.save(update_fields=["ai_score", "summary", "updated_at"])
        logger.info("AI summary generated for call %s (score=%.1f)", call_id, call.ai_score)

    except Exception as exc:
        logger.error("AI summary generation failed for call %s: %s", call_id, exc)
        raise self.retry(exc=exc)
