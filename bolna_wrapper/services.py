"""
Service layer for communicating with Bolna AI APIs.

All outbound HTTP requests to Bolna live here, keeping views thin and
making it easy to swap or mock the transport layer during testing.
"""

import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Timeout (seconds) for all outbound Bolna requests
# ---------------------------------------------------------------------------
REQUEST_TIMEOUT = 30


class BolnaAPIError(Exception):
    """Raised when the Bolna API returns a non-success response."""

    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"Bolna API error {status_code}: {detail}")


class BolnaService:
    """Encapsulates all interactions with the Bolna AI API."""

    def __init__(self):
        self.base_url = settings.BOLNA_API_BASE_URL.rstrip("/")
        self.api_key = settings.BOLNA_API_KEY
        if not self.api_key:
            logger.warning("BOLNA_API_KEY is not set — API calls will fail.")

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _headers(self) -> dict:
        """Return common headers for every Bolna request."""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _request(self, method: str, path: str, **kwargs) -> dict:
        """
        Send an HTTP request to Bolna and return the parsed JSON body.

        Raises BolnaAPIError for non-2xx responses so callers can
        translate it into the appropriate DRF error response.
        """
        url = f"{self.base_url}{path}"
        logger.info("Bolna API %s %s", method.upper(), url)

        try:
            response = requests.request(
                method=method,
                url=url,
                headers=self._headers(),
                timeout=REQUEST_TIMEOUT,
                **kwargs,
            )
        except requests.exceptions.ConnectionError:
            raise BolnaAPIError(503, "Unable to connect to Bolna AI API.")
        except requests.exceptions.Timeout:
            raise BolnaAPIError(504, "Bolna AI API request timed out.")
        except requests.exceptions.RequestException as exc:
            raise BolnaAPIError(500, f"Unexpected request error: {exc}")

        if not response.ok:
            # Try to extract a meaningful error message from the body
            try:
                error_body = response.json()
                detail = error_body.get("message", response.text)
            except ValueError:
                detail = response.text
            raise BolnaAPIError(response.status_code, detail)

        # Some endpoints may return 204 No Content
        if response.status_code == 204:
            return {}

        return response.json()

    # ------------------------------------------------------------------
    # Public API methods
    # ------------------------------------------------------------------

    def call_bolna(self, payload: dict) -> dict:
        """
        Generic proxy: forward an arbitrary payload to Bolna's
        /call endpoint and return the response.

        This is useful for one-off or exploratory calls where the
        frontend passes a full request body.
        """
        return self._request("POST", "/call", json=payload)

    def start_call(self, agent_id: str, recipient_phone_number: str, **extra) -> dict:
        """
        Initiate a new outbound voice call through Bolna.

        Args:
            agent_id: The Bolna agent identifier.
            recipient_phone_number: E.164 formatted phone number.
            **extra: Any additional fields accepted by the Bolna API.
        """
        payload = {
            "agent_id": agent_id,
            "recipient_phone_number": recipient_phone_number,
            **extra,
        }
        return self._request("POST", "/call", json=payload)

    def get_call_status(self, call_id: str) -> dict:
        """
        Retrieve the current status of an existing call.

        Args:
            call_id: The unique call identifier returned by start_call.
        """
        return self._request("GET", f"/call/{call_id}")

    def list_agents(self) -> dict:
        """
        List all available Bolna agents for the authenticated account.
        """
        return self._request("GET", "/agent")

    def get_agent(self, agent_id: str) -> dict:
        """
        Get details for a specific Bolna agent.

        Args:
            agent_id: The Bolna agent identifier.
        """
        return self._request("GET", f"/agent/{agent_id}")

    def create_agent(self, payload: dict) -> dict:
        """
        Create a new Bolna agent.

        Args:
            payload: Agent configuration as expected by the Bolna API.
        """
        return self._request("POST", "/agent", json=payload)
