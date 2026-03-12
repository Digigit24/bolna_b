"""
Custom DRF permissions for role-based access control.
"""

from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Only allow users with the 'admin' role."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


class IsRecruiterOrAdmin(BasePermission):
    """Allow admins and recruiters."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in (
            "admin", "recruiter",
        )


class IsOrgMember(BasePermission):
    """Ensure the user belongs to the organization in the request context."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request, "organization")
            and request.organization is not None
        )
