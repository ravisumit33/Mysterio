from django.contrib.auth import get_user_model
from rest_framework import viewsets, mixins
from core.serializers import UserSerializer
from core.permissions import UserPermission


class UserViewSet(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):  # pylint: disable=too-many-ancestors

    """
    API endpoint that allows users to be created or deleted.
    """

    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    permission_classes = [UserPermission]
