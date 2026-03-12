"""
Service layer for communicating with the Bolna AI API.

All Bolna HTTP calls are centralized here so that views and tasks
never make direct HTTP requests.  This keeps the codebase modular
and makes it easy to swap or mock the external dependency.

Methods:
    start_call(phone, agent_config) → dict
    get_call_status(call_id)        → dict
    handle_webhook(payload)         → dict
"""

import logging

import requests
from django.conf import settings

logger = logging.getLogger("bolna")

# Timeout for outbound HTTP requests (connect, read) in seconds
REQUEST_TIMEOUT = (10, 30)


class BolnaServiceError(Exception):
    """Raised when the Bolna API returns an error or is unreachable."""

    def __init__(self, message: str, status_code: int | None = None, response_body: dict | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.response_body = response_body or {}


class BolnaService:
    """
    Client wrapper around Bolna AI REST API.

    Usage:
        service = BolnaService()
        result  = service.start_call("+14155551234", {"agent_id": "xyz"})
    """

    def __init__(self):
        self.base_url = settings.BOLNA_API_BASE_URL.rstrip("/")
        self.api_key = settings.BOLNA_API_KEY
        if not self.api_key:
            logger.warning("BOLNA_API_KEY is not set — API calls will fail.")

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _headers(self) -> dict:
        """Return default headers with auth token."""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _request(self, method: str, path: str, **kwargs) -> dict:
        """
        Send an HTTP request to Bolna and return the parsed JSON body.

        Raises BolnaServiceError on non-2xx responses or network errors.
        """
        url = f"{self.base_url}{path}"
        kwargs.setdefault("headers", self._headers())
        kwargs.setdefault("timeout", REQUEST_TIMEOUT)

        logger.debug("Bolna %s %s", method.upper(), url)

        try:
            response = requests.request(method, url, **kwargs)
        except requests.ConnectionError as exc:
            logger.error("Bolna connection error: %s", exc)
            raise BolnaServiceError(f"Cannot reach Bolna API: {exc}") from exc
        except requests.Timeout as exc:
            logger.error("Bolna timeout: %s", exc)
            raise BolnaServiceError("Bolna API request timed out") from exc

        # Parse response body
        try:
            body = response.json()
        except ValueError:
            body = {"raw": response.text}

        if not response.ok:
            msg = f"Bolna API error {response.status_code}: {body}"
            logger.error(msg)
            raise BolnaServiceError(msg, status_code=response.status_code, response_body=body)

        return body

    # ------------------------------------------------------------------
    # Public API methods
    # ------------------------------------------------------------------

    def start_call(self, phone: str, agent_config: dict | None = None) -> dict:
        """
        Initiate an outbound call to the given phone number.

        Args:
            phone:        E.164 formatted phone number (e.g. "+14155551234")
            agent_config: Bolna agent configuration dict (agent_id, prompts, etc.)

        Returns:
            Dict with at least {"call_id": "...", "status": "initiated"}
        """
        payload = {
            "recipient_phone_number": phone,
        }
        if agent_config:
            payload.update(agent_config)

        logger.info("Starting call to %s", phone)
        result = self._request("POST", "/call", json=payload)
        logger.info("Call started: %s", result.get("call_id"))
        return result

    def get_call_status(self, call_id: str) -> dict:
        """
        Poll Bolna for the current status of a call.

        Args:
            call_id: The Bolna call ID.

        Returns:
            Dict with call details (status, duration, transcript, etc.)
        """
        logger.debug("Fetching status for call %s", call_id)
        return self._request("GET", f"/call/{call_id}")

    def handle_webhook(self, payload: dict) -> dict:
        """
        Process an inbound webhook payload from Bolna.

        This does NOT make an outbound HTTP call — it simply validates
        and normalizes the webhook data so the caller can persist it.

        Args:
            payload: Raw webhook JSON body from Bolna.

        Returns:
            Normalized dict with keys:
                call_id, status, duration, transcript, recording_url
        """
        call_id = payload.get("call_id", "")
        event_type = payload.get("event", payload.get("type", "unknown"))

        logger.info("Webhook received: event=%s call_id=%s", event_type, call_id)

        # Normalize fields across possible payload shapes
        normalized = {
            "call_id": call_id,
            "status": payload.get("status", ""),
            "duration": payload.get("duration", 0),
            "transcript": payload.get("transcript", ""),
            "recording_url": payload.get("recording_url", ""),
        }

        return normalized
