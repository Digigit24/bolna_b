from rest_framework import serializers

from calls.models import CandidateCall


class CandidateCallSerializer(serializers.ModelSerializer):
    """Full read representation of a call."""

    candidate_name = serializers.CharField(source="candidate.name", read_only=True)

    class Meta:
        model = CandidateCall
        fields = [
            "id", "candidate", "candidate_name", "bolna_call_id",
            "agent_config", "status", "duration", "recording_url",
            "transcript", "ai_score", "summary", "retry_count",
            "error_message", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "bolna_call_id", "status", "duration",
            "recording_url", "transcript", "ai_score", "summary",
            "retry_count", "error_message", "created_at", "updated_at",
        ]


class StartCallSerializer(serializers.Serializer):
    """Validate the request to initiate a call to a candidate."""

    candidate_id = serializers.UUIDField()
    agent_config = serializers.DictField(
        required=False,
        default=dict,
        help_text="Optional Bolna agent configuration overrides",
    )
