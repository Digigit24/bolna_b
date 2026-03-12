"""
Interview model — tracks scheduled interviews for qualified candidates.

After an AI call qualifies a candidate, recruiters can schedule
follow-up interviews (technical, HR, managerial).
"""

import uuid

from django.conf import settings
from django.db import models


class Interview(models.Model):
    """A scheduled interview for a candidate."""

    class InterviewType(models.TextChoices):
        TECHNICAL = "technical", "Technical"
        HR = "hr", "HR"
        MANAGERIAL = "managerial", "Managerial"
        FINAL = "final", "Final"

    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Scheduled"
        COMPLETED = "completed", "Completed"
        CANCELED = "canceled", "Canceled"
        NO_SHOW = "no_show", "No Show"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(
        "candidates.Candidate",
        on_delete=models.CASCADE,
        related_name="interviews",
    )
    job = models.ForeignKey(
        "jobs.Job",
        on_delete=models.CASCADE,
        related_name="interviews",
    )
    interview_type = models.CharField(
        max_length=15,
        choices=InterviewType.choices,
        default=InterviewType.TECHNICAL,
    )
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.SCHEDULED,
        db_index=True,
    )
    scheduled_at = models.DateTimeField()
    interviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="interviews_assigned",
    )
    notes = models.TextField(blank=True)
    feedback = models.TextField(blank=True)
    rating = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text="Interviewer rating 1-10",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "interviews"
        ordering = ["-scheduled_at"]
        indexes = [
            models.Index(fields=["candidate", "status"]),
        ]

    def __str__(self):
        return f"{self.interview_type} interview — {self.candidate.name}"
