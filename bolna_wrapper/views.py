"""
API views for the Bolna wrapper.

Each view validates the incoming request, delegates to the service
layer, and returns a structured JSON response.
"""

import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import CallBolnaSerializer, CallStatusSerializer, StartCallSerializer
from .services import BolnaAPIError, BolnaService

logger = logging.getLogger(__name__)


class CallBolnaView(APIView):
    """
    POST /api/call-bolna/

    Generic proxy endpoint: accepts any JSON body and forwards it
    to the Bolna /call API.  Useful for ad-hoc or exploratory
    integrations where the frontend crafts the full Bolna payload.
    """

    def post(self, request):
        serializer = CallBolnaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = BolnaService()
        try:
            result = service.call_bolna(serializer.validated_data)
        except BolnaAPIError as exc:
            logger.error("call_bolna failed: %s", exc)
            return Response(
                {"success": False, "error": {"code": exc.status_code, "message": exc.detail}},
                status=exc.status_code,
            )

        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)


class StartCallView(APIView):
    """
    POST /api/start-call/

    Initiate an outbound voice call via Bolna.

    Required fields:
        - agent_id
        - recipient_phone_number
    """

    def post(self, request):
        serializer = StartCallSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        service = BolnaService()
        try:
            result = service.start_call(
                agent_id=data["agent_id"],
                recipient_phone_number=data["recipient_phone_number"],
                **(data.get("user_data") or {}),
            )
        except BolnaAPIError as exc:
            logger.error("start_call failed: %s", exc)
            return Response(
                {"success": False, "error": {"code": exc.status_code, "message": exc.detail}},
                status=exc.status_code,
            )

        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)


class CallStatusView(APIView):
    """
    GET /api/call-status/?call_id=<id>

    Retrieve the current status of an existing Bolna call.
    """

    def get(self, request):
        serializer = CallStatusSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        call_id = serializer.validated_data["call_id"]
        service = BolnaService()
        try:
            result = service.get_call_status(call_id)
        except BolnaAPIError as exc:
            logger.error("get_call_status failed: %s", exc)
            return Response(
                {"success": False, "error": {"code": exc.status_code, "message": exc.detail}},
                status=exc.status_code,
            )

        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)


class ListAgentsView(APIView):
    """
    GET /api/agents/

    List all available Bolna agents.
    """

    def get(self, request):
        service = BolnaService()
        try:
            result = service.list_agents()
        except BolnaAPIError as exc:
            logger.error("list_agents failed: %s", exc)
            return Response(
                {"success": False, "error": {"code": exc.status_code, "message": exc.detail}},
                status=exc.status_code,
            )

        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)


class AgentDetailView(APIView):
    """
    GET /api/agents/<agent_id>/

    Get details for a specific Bolna agent.
    """

    def get(self, request, agent_id):
        service = BolnaService()
        try:
            result = service.get_agent(agent_id)
        except BolnaAPIError as exc:
            logger.error("get_agent failed: %s", exc)
            return Response(
                {"success": False, "error": {"code": exc.status_code, "message": exc.detail}},
                status=exc.status_code,
            )

        return Response({"success": True, "data": result}, status=status.HTTP_200_OK)


class CreateAgentView(APIView):
    """
    POST /api/agents/

    Create a new Bolna agent.
    """

    def post(self, request):
        if not isinstance(request.data, dict):
            return Response(
                {"success": False, "error": {"code": 400, "message": "Request body must be a JSON object."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = BolnaService()
        try:
            result = service.create_agent(request.data)
        except BolnaAPIError as exc:
            logger.error("create_agent failed: %s", exc)
            return Response(
                {"success": False, "error": {"code": exc.status_code, "message": exc.detail}},
                status=exc.status_code,
            )

        return Response({"success": True, "data": result}, status=status.HTTP_201_CREATED)


class HealthCheckView(APIView):
    """
    GET /api/health/

    Simple health-check endpoint for monitoring and load balancers.
    """

    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)
