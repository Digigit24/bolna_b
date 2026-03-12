"""
Middleware that attaches the current user's Organization to
every request, enabling multi-tenant data isolation downstream.
"""


class OrganizationMiddleware:
    """
    Sets ``request.organization`` from the authenticated user.
    Views and querysets can then filter by ``request.organization``
    to enforce tenant isolation.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.organization = None
        if hasattr(request, "user") and request.user.is_authenticated:
            request.organization = getattr(request.user, "organization", None)
        return self.get_response(request)
