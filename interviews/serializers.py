from rest_framework import serializers

from interviews.models import Interview


class InterviewSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source="candidate.name", read_only=True)
    job_title = serializers.CharField(source="job.title", read_only=True)
    interviewer_name = serializers.CharField(
        source="interviewer.get_full_name", read_only=True, default="",
    )

    class Meta:
        model = Interview
        fields = [
            "id", "candidate", "candidate_name", "job", "job_title",
            "interview_type", "status", "scheduled_at", "interviewer",
            "interviewer_name", "notes", "feedback", "rating",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
