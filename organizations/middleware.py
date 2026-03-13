"""
Middleware that attaches the current user's Organization to
every request, enabling multi-tenant data isolation downstream.

IMPORTANT: DRF TokenAuthentication runs at the view level, NOT at the
Django middleware level. This means request.user may still be
AnonymousUser when this middleware runs. We solve this by setting
request.organization as a lazy property that evaluates when first
accessed (by which point DRF has already authenticated the user).
"""


class _LazyOrganization:
    """Descriptor that resolves request.organization lazily."""

    def __get__(self, request, objtype=None):
        if request is None:
            return self
        if not hasattr(request, "_cached_organization"):
            if hasattr(request, "user") and request.user.is_authenticated:
                request._cached_organization = getattr(request.user, "organization", None)
            else:
                request._cached_organization = None
        return request._cached_organization

    def __set__(self, request, value):
        request._cached_organization = value


class OrganizationMiddleware:
    """
    Sets ``request.organization`` from the authenticated user.
    Views and querysets can then filter by ``request.organization``
    to enforce tenant isolation.

    Uses a lazy property so it works with both Django session auth
    AND DRF token authentication (which runs at the view layer).
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Install the lazy descriptor on the request class if not already done
        request.__class__.organization = _LazyOrganization()
        return self.get_response(request)
