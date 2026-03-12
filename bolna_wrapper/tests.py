"""
Unit tests for the bolna_wrapper app.
"""

from unittest.mock import MagicMock, patch

from django.test import TestCase
from rest_framework.test import APIClient

from .services import BolnaAPIError, BolnaService


class HealthCheckTests(TestCase):
    """Tests for the /api/health/ endpoint."""

    def setUp(self):
        self.client = APIClient()

    def test_health_check_returns_ok(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})


class StartCallViewTests(TestCase):
    """Tests for the /api/start-call/ endpoint."""

    def setUp(self):
        self.client = APIClient()

    @patch.object(BolnaService, "start_call")
    def test_start_call_success(self, mock_start_call):
        mock_start_call.return_value = {"call_id": "abc123", "status": "initiated"}

        response = self.client.post(
            "/api/start-call/",
            {"agent_id": "agent_1", "recipient_phone_number": "+1234567890"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["call_id"], "abc123")

    def test_start_call_missing_fields(self):
        response = self.client.post("/api/start-call/", {}, format="json")
        self.assertEqual(response.status_code, 400)

    @patch.object(BolnaService, "start_call")
    def test_start_call_bolna_error(self, mock_start_call):
        mock_start_call.side_effect = BolnaAPIError(502, "Upstream error")

        response = self.client.post(
            "/api/start-call/",
            {"agent_id": "agent_1", "recipient_phone_number": "+1234567890"},
            format="json",
        )

        self.assertEqual(response.status_code, 502)
        data = response.json()
        self.assertFalse(data["success"])


class CallStatusViewTests(TestCase):
    """Tests for the /api/call-status/ endpoint."""

    def setUp(self):
        self.client = APIClient()

    @patch.object(BolnaService, "get_call_status")
    def test_call_status_success(self, mock_get_status):
        mock_get_status.return_value = {"call_id": "abc123", "status": "completed"}

        response = self.client.get("/api/call-status/", {"call_id": "abc123"})

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])

    def test_call_status_missing_call_id(self):
        response = self.client.get("/api/call-status/")
        self.assertEqual(response.status_code, 400)


class CallBolnaViewTests(TestCase):
    """Tests for the /api/call-bolna/ endpoint."""

    def setUp(self):
        self.client = APIClient()

    @patch.object(BolnaService, "call_bolna")
    def test_call_bolna_success(self, mock_call_bolna):
        mock_call_bolna.return_value = {"result": "ok"}

        response = self.client.post(
            "/api/call-bolna/",
            {"agent_id": "agent_1", "action": "test"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])


class BolnaServiceTests(TestCase):
    """Tests for the BolnaService class."""

    @patch("bolna_wrapper.services.requests.request")
    def test_request_success(self, mock_request):
        mock_response = MagicMock()
        mock_response.ok = True
        mock_response.status_code = 200
        mock_response.json.return_value = {"id": "123"}
        mock_request.return_value = mock_response

        service = BolnaService()
        result = service.get_call_status("123")

        self.assertEqual(result, {"id": "123"})

    @patch("bolna_wrapper.services.requests.request")
    def test_request_api_error(self, mock_request):
        mock_response = MagicMock()
        mock_response.ok = False
        mock_response.status_code = 404
        mock_response.text = "Not found"
        mock_response.json.return_value = {"message": "Not found"}
        mock_request.return_value = mock_response

        service = BolnaService()
        with self.assertRaises(BolnaAPIError) as ctx:
            service.get_call_status("nonexistent")

        self.assertEqual(ctx.exception.status_code, 404)
