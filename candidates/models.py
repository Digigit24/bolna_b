"""
Candidate model — a person being considered for a Job.
Fields match the spec: name, phone, email, resume_url,
experience_years, skills, status.
"""

import uuid

from django.db import models


class Candidate(models.Model):
    """A candidate linked to a specific job posting."""

    class Status(models.TextChoices):
        NEW = "new", "New"
        SCREENING = "screening", "Screening"
        INTERVIEWED = "interviewed", "Interviewed"
        SHORTLISTED = "shortlisted", "Shortlisted"
        REJECTED = "rejected", "Rejected"
        HIRED = "hired", "Hired"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="candidates",
    )
    job = models.ForeignKey(
        "jobs.Job",
        on_delete=models.CASCADE,
        related_name="candidates",
    )
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, db_index=True)
    email = models.EmailField(blank=True)
    resume_url = models.URLField(blank=True, help_text="S3/MinIO URL to the uploaded resume")
    experience_years = models.PositiveSmallIntegerField(default=0)
    skills = models.JSONField(
        default=list,
        blank=True,
        help_text='List of skill strings, e.g. ["Python", "Django"]',
    )
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.NEW,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "candidates"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization", "status"]),
            models.Index(fields=["job", "status"]),
        ]

    def __str__(self):
        return f"{self.name} — {self.job.title}"
