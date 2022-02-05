from django.contrib.auth import get_user_model
from rest_framework import serializers
from dj_rest_auth.serializers import LoginSerializer as RestAuthLoginSerializer


class LoginSerializer(RestAuthLoginSerializer):  # pylint: disable=abstract-method
    """
    Custom login serializer to remove username field & make email field required
    """

    username = None
    email = serializers.EmailField()


class UserDetailsSerializer(serializers.ModelSerializer):
    """
    Custom user details serializer to add is_socially_registered field
    """

    is_socially_registered = serializers.SerializerMethodField(read_only=True)

    def get_is_socially_registered(self, user):  # pylint: disable=R0201
        """
        Set if user is socially registered
        """
        return user.socialaccount_set.all().exists()

    class Meta:
        model = get_user_model()
        fields = ["pk", "email", "is_socially_registered"]
