"""
CandidateCall model — tracks every call made to a candidate via Bolna AI.

Fields: bolna_call_id, status, duration, recording_url, transcript,
ai_score, summary, retry_count.
"""

import uuid

from django.db import models


class CandidateCall(models.Model):
    """A single call placed to a candidate through Bolna AI."""

    class Status(models.TextChoices):
        QUEUED = "queued", "Queued"
        CALLING = "calling", "Calling"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(
        "candidates.Candidate",
        on_delete=models.CASCADE,
        related_name="calls",
    )
    # Bolna-specific fields
    bolna_call_id = models.CharField(
        max_length=255,
        blank=True,
        db_index=True,
        help_text="Call ID returned by Bolna API",
    )
    agent_config = models.JSONField(
        default=dict,
        blank=True,
        help_text="Agent configuration sent to Bolna for this call",
    )
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.QUEUED,
        db_index=True,
    )
    duration = models.PositiveIntegerField(
        default=0,
        help_text="Call duration in seconds",
    )
    recording_url = models.URLField(
        blank=True,
        help_text="S3/MinIO URL to the call recording",
    )
    transcript = models.TextField(
        blank=True,
        help_text="Full transcript of the call",
    )
    ai_score = models.FloatField(
        null=True,
        blank=True,
        help_text="AI-generated candidate score (0-100)",
    )
    summary = models.TextField(
        blank=True,
        help_text="AI-generated summary of the call",
    )
    retry_count = models.PositiveSmallIntegerField(
        default=0,
        help_text="Number of retry attempts made",
    )
    error_message = models.TextField(
        blank=True,
        help_text="Error details if the call failed",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "candidate_calls"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["candidate", "status"]),
            models.Index(fields=["bolna_call_id"]),
        ]

    def __str__(self):
        return f"Call {self.bolna_call_id or 'pending'} → {self.candidate.name}"
