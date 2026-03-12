"""
DRF serializers for request validation.

These serializers validate incoming data from the React frontend
before it is forwarded to the Bolna AI API.
"""

from rest_framework import serializers


class CallBolnaSerializer(serializers.Serializer):
    """
    Generic serializer for the /api/call-bolna/ endpoint.
    Accepts any JSON payload and forwards it to Bolna.
    """

    # We allow arbitrary keys — the Bolna API decides what is valid.
    # The serializer simply ensures the body is well-formed JSON.

    def to_internal_value(self, data):
        """Accept any dict payload as-is."""
        if not isinstance(data, dict):
            raise serializers.ValidationError("Request body must be a JSON object.")
        return data


class StartCallSerializer(serializers.Serializer):
    """
    Validates the payload for the /api/start-call/ endpoint.
    """

    agent_id = serializers.CharField(
        max_length=255,
        help_text="Bolna agent identifier.",
    )
    recipient_phone_number = serializers.CharField(
        max_length=20,
        help_text="Recipient phone number in E.164 format (e.g. +1234567890).",
    )

    # Optional extra fields the frontend may send
    user_data = serializers.DictField(
        required=False,
        help_text="Optional metadata to attach to the call.",
    )


class CallStatusSerializer(serializers.Serializer):
    """
    Validates query parameters for the /api/call-status/ endpoint.
    """

    call_id = serializers.CharField(
        max_length=255,
        help_text="Unique call identifier returned by the start-call endpoint.",
    )
