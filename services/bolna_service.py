"""
Service layer for communicating with the Bolna AI API.

All Bolna HTTP calls are centralized here so that views and tasks
never make direct HTTP requests.  This keeps the codebase modular
and makes it easy to swap or mock the external dependency.

Bolna API docs: https://docs.bolna.ai/api-reference/introduction
Base URL: https://api.bolna.ai
Auth: Bearer token via Authorization header
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
    Client wrapper around Bolna AI REST API (https://api.bolna.ai).

    Usage:
        service = BolnaService()
        result  = service.start_call("+14155551234", {"agent_id": "uuid"})
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
        """Return default headers with Bearer auth token."""
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
    # Call endpoints
    # ------------------------------------------------------------------

    def start_call(self, phone: str, agent_config: dict | None = None) -> dict:
        """
        Initiate an outbound call via Bolna.
        Endpoint: POST /call

        Args:
            phone:        E.164 phone number (e.g. "+14155551234")
            agent_config: Dict with at least {"agent_id": "uuid"}.
                          Optionally: from_phone_number, retry_config.

        Returns:
            {"call_id": "...", "status": "queued"}
        """
        payload = {
            "recipient_phone_number": phone,
        }
        if agent_config:
            payload.update(agent_config)

        logger.info("Starting call to %s", phone)
        result = self._request("POST", "/call", json=payload)
        logger.info("Call started: %s", result.get("call_id", result.get("id")))
        return result

    def get_execution(self, execution_id: str) -> dict:
        """
        Get full details of a call execution.
        Endpoint: GET /executions/{execution_id}

        Returns dict with: id, status, conversation_time, transcript,
        telephony_data (recording_url, duration, hangup_by, etc.),
        extracted_data, cost_breakdown, total_cost.
        """
        logger.debug("Fetching execution %s", execution_id)
        return self._request("GET", f"/executions/{execution_id}")

    def stop_call(self, execution_id: str) -> dict:
        """
        Cancel a queued or scheduled call.
        Endpoint: POST /call/{execution_id}/stop
        """
        logger.info("Stopping call %s", execution_id)
        return self._request("POST", f"/call/{execution_id}/stop")

    # ------------------------------------------------------------------
    # Agent endpoints (v2)
    # ------------------------------------------------------------------

    def create_agent(self, agent_config: dict, agent_prompts: dict) -> dict:
        """
        Create a new voice AI agent.
        Endpoint: POST /v2/agent

        Args:
            agent_config: Dict with agent_name, agent_welcome_message,
                          webhook_url, tasks (array of task configs).
            agent_prompts: Dict like {"task_1": {"system_prompt": "..."}}.

        Returns:
            {"agent_id": "uuid", "status": "created"}
        """
        payload = {
            "agent_config": agent_config,
            "agent_prompts": agent_prompts,
        }
        logger.info("Creating Bolna agent: %s", agent_config.get("agent_name"))
        return self._request("POST", "/v2/agent", json=payload)

    def get_agent(self, agent_id: str) -> dict:
        """
        Retrieve agent configuration.
        Endpoint: GET /v2/agent/{agent_id}
        """
        return self._request("GET", f"/v2/agent/{agent_id}")

    def list_agents(self, page: int = 1, page_size: int = 20) -> dict:
        """
        List all agents for the account.
        Endpoint: GET /v2/agent/all
        """
        return self._request("GET", "/v2/agent/all", params={
            "page_number": page,
            "page_size": page_size,
        })

    def update_agent(self, agent_id: str, updates: dict) -> dict:
        """
        Partial update of an agent (name, prompt, voice, webhook, etc.).
        Endpoint: PATCH /v2/agent/{agent_id}
        """
        return self._request("PATCH", f"/v2/agent/{agent_id}", json=updates)

    def delete_agent(self, agent_id: str) -> dict:
        """
        Delete an agent and all its data.
        Endpoint: DELETE /v2/agent/{agent_id}
        """
        logger.warning("Deleting Bolna agent %s", agent_id)
        return self._request("DELETE", f"/v2/agent/{agent_id}")

    def list_agent_executions(self, agent_id: str, page: int = 1, page_size: int = 20) -> dict:
        """
        List all call executions for an agent.
        Endpoint: GET /v2/agent/{agent_id}/executions
        """
        return self._request("GET", f"/v2/agent/{agent_id}/executions", params={
            "page_number": page,
            "page_size": page_size,
        })

    # ------------------------------------------------------------------
    # Batch endpoints
    # ------------------------------------------------------------------

    def get_batch_status(self, batch_id: str) -> dict:
        """Endpoint: GET /batches/{batch_id}"""
        return self._request("GET", f"/batches/{batch_id}")

    # ------------------------------------------------------------------
    # Webhook normalization (no HTTP call — pure data transform)
    # ------------------------------------------------------------------

    def handle_webhook(self, payload: dict) -> dict:
        """
        Normalize an inbound webhook payload from Bolna.

        Bolna sends the execution object directly. Key fields:
          - id: execution ID (= our bolna_call_id)
          - status: completed, failed, no-answer, busy, etc.
          - conversation_time: seconds
          - transcript: full text
          - telephony_data.recording_url: audio file URL
          - telephony_data.duration: call duration
          - extracted_data: structured extraction from the call
          - total_cost: cost in cents
        """
        # The execution ID is in 'id' (not 'call_id')
        execution_id = payload.get("id", payload.get("call_id", ""))
        telephony = payload.get("telephony_data", {})
        status = payload.get("status", "")

        logger.info("Webhook received: execution_id=%s status=%s", execution_id, status)

        return {
            "execution_id": execution_id,
            "status": status,
            "duration": int(telephony.get("duration", 0) if telephony.get("duration") else 0),
            "transcript": payload.get("transcript", ""),
            "recording_url": telephony.get("recording_url", ""),
            "conversation_time": payload.get("conversation_time", 0),
            "extracted_data": payload.get("extracted_data", {}),
            "total_cost": payload.get("total_cost", 0),
            "hangup_by": telephony.get("hangup_by", ""),
            "hangup_reason": telephony.get("hangup_reason", ""),
            "answered_by_voicemail": payload.get("answered_by_voice_mail", False),
            "error_message": payload.get("error_message", ""),
        }
