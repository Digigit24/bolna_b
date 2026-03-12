"""Serializers for user registration, profile, and listing."""

from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Read-only representation of a user."""

    organization_name = serializers.CharField(
        source="organization.name", read_only=True, default=None,
    )

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "role", "phone", "organization", "organization_name",
            "is_active", "date_joined",
        ]
        read_only_fields = ["id", "date_joined"]


class UserCreateSerializer(serializers.ModelSerializer):
    """Create a new user with password."""

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "password", "first_name",
            "last_name", "role", "phone", "organization",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Validate login credentials."""

    username = serializers.CharField()
    password = serializers.CharField()
