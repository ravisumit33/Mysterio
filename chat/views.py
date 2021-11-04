from django.contrib.auth.hashers import check_password
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from chat.serializers import (
    DefaultGroupRoomSerializer,
    RetrieveGroupRoomSerializer,
    GroupRoomPasswordSerializer,
)
from chat.models import GroupRoom
from chat.permissions import GroupRoomPermission
from chat.constants import GroupPrefix, MessageType
from chat.utils import channel_layer


class GroupRoomViewSet(viewsets.ModelViewSet):  # pylint: disable=too-many-ancestors
    """
    API endpoint that allows group rooms to be created, viewed, listed, edited & deleted.
    """

    queryset = GroupRoom.objects.all()
    permission_classes = [GroupRoomPermission]
    serializer_classes = {
        "retrieve": RetrieveGroupRoomSerializer,
        "check_password": GroupRoomPasswordSerializer,
    }

    def get_serializer_class(self, *args, **kwargs):
        if self.action in self.serializer_classes:
            return self.serializer_classes[self.action]
        return DefaultGroupRoomSerializer

    def destroy(self, request, *args, **kwargs):
        group_room = self.get_object()
        channel_layer.group_send(
            GroupPrefix.GROUP_ROOM + str(group_room.id),
            MessageType.CHAT_DELETE,
            {
                "text": "Room is deleted",
            },
        )
        return super().destroy(request, *args, **kwargs)

    @action(methods=["post"], detail=True, permission_classes=[AllowAny])
    def check_password(
        self, request, pk=None
    ):  # pylint: disable=unused-argument,invalid-name
        """
        Action for checking group room password
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        group_room = self.get_object()
        request_password = request.data.get("password")
        password_valid = check_password(request_password, group_room.password)
        return (
            Response(status=status.HTTP_200_OK)
            if password_valid
            else Response(status=status.HTTP_400_BAD_REQUEST)
        )
