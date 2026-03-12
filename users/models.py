"""
Custom user model supporting three roles: Admin, Recruiter, Hiring Manager.
Each user belongs to exactly one Organization (multi-tenant isolation).
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended user with role and organization affiliation."""

    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        RECRUITER = "recruiter", "Recruiter"
        HIRING_MANAGER = "hiring_manager", "Hiring Manager"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.RECRUITER,
        db_index=True,
    )
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="members",
        null=True,
        blank=True,
    )
    phone = models.CharField(max_length=20, blank=True)

    class Meta:
        db_table = "users"
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def is_recruiter(self):
        return self.role == self.Role.RECRUITER

    @property
    def is_hiring_manager(self):
        return self.role == self.Role.HIRING_MANAGER
