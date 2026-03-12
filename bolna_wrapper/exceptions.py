"""
Custom exception handler for Django REST Framework.

Provides a consistent JSON error envelope for all API errors.
"""

import logging

from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Wrap the default DRF exception handler to return a uniform
    error response shape:

        {
            "success": false,
            "error": {
                "code": <HTTP status code>,
                "message": "<human-readable message>"
            }
        }
    """
    response = exception_handler(exc, context)

    if response is not None:
        # Build a consistent error payload
        if isinstance(response.data, dict):
            message = response.data.get("detail", str(response.data))
        elif isinstance(response.data, list):
            message = "; ".join(str(item) for item in response.data)
        else:
            message = str(response.data)

        response.data = {
            "success": False,
            "error": {
                "code": response.status_code,
                "message": message,
            },
        }
    else:
        # Unhandled exception — log it
        logger.exception("Unhandled exception in view: %s", exc)

    return response
