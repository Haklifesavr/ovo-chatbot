from django.core import exceptions
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User, Company


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ('id', 'name', 'es_index')


class UserSerializer(serializers.ModelSerializer):
    company = CompanySerializer()
    confirm_password = serializers.CharField(max_length=60, write_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "password",
            "confirm_password",
            "is_admin",
            "company"
        )
        extra_kwargs = {
            "id": {"read_only": True},
            "password": {"write_only": True},
            "is_admin": {"read_only": True},
        }

    def save(self):
        del self.validated_data["confirm_password"]
        del self.validated_data["company_name"]

        user = User(**self.validated_data)
        user.set_password(self.validated_data.get("password"))
        user.save()
        return user

    def validate(self, data):
        data = super().validate(data)
        try:
            if data.get("password") != data.get("confirm_password"):
                raise serializers.ValidationError({"error": "Password doesn't match"})
            validate_password(password=data.get("password"))
            return data
        except exceptions.ValidationError as e:
            errors = {"password": list(e.messages)}
            raise serializers.ValidationError(errors) from e
