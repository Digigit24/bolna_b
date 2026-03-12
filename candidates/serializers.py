from rest_framework import serializers

from candidates.models import Candidate


class CandidateSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="job.title", read_only=True)

    class Meta:
        model = Candidate
        fields = [
            "id", "organization", "job", "job_title", "name", "phone",
            "email", "resume_url", "experience_years", "skills", "status",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "organization", "created_at", "updated_at"]


class CandidateBulkCreateSerializer(serializers.Serializer):
    """Accept a list of candidates for batch import."""

    candidates = CandidateSerializer(many=True)

    def create(self, validated_data):
        org = self.context["organization"]
        candidates = [
            Candidate(organization=org, **item)
            for item in validated_data["candidates"]
        ]
        return Candidate.objects.bulk_create(candidates)
