from rest_framework import serializers

from jobs.models import Job


class JobSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True, default="",
    )

    class Meta:
        model = Job
        fields = [
            "id", "organization", "title", "description", "requirements",
            "location", "status", "created_by", "created_by_name",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "organization", "created_by", "created_at", "updated_at"]
