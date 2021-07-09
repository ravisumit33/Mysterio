from django.contrib.auth import get_user_model, authenticate, login
from rest_framework import serializers
from rest_framework.validators import UniqueValidator


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for users API endpoint
    """

    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=get_user_model().objects.all(), message="Email already exists"
            )
        ]
    )

    def create(self, validated_data):
        instance = self.Meta.model.objects.create_user(**validated_data)
        request = self.context.get("request")
        username = validated_data.get("username")
        password = validated_data.get("password")

        user = authenticate(
            request,
            username=username,
            password=password,
        )
        if not user:
            raise serializers.ValidationError({"__all__": ["Unable to authenticate"]})
        login(request, user)
        return instance

    class Meta:
        model = get_user_model()
        fields = ("username", "password", "email")
