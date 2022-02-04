import logging
from abc import abstractmethod
from django.contrib.sessions.models import Session
from django.contrib.auth.hashers import check_password
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from chat.models.room import IndividualRoom
from chat.serializers import (
    DefaultGroupRoomSerializer,
    PlayerSerializer,
    RetrieveGroupRoomSerializer,
)
from chat.models import GroupRoom
from chat.permissions import GroupRoomPermission, IndividualRoomPermission
from chat.constants import GroupPrefix, MessageType
from chat.utils import channel_layer

logger = logging.getLogger(__name__)


class RoomViewSet(viewsets.ModelViewSet):  # pylint: disable=too-many-ancestors

    """
    Base viewset for rooms
    """

    serializer_classes = {
        "get_player": PlayerSerializer,
        "update_player": PlayerSerializer,
    }

    @property
    @abstractmethod
    def is_group_room(self):
        """
        Abstract property to be implemented by subclasses.
        Returns whether viewset is for group room or not.
        """
        raise NotImplementedError("Subclasses should implement this property")

    def get_serializer_class(self, *args, **kwargs):
        return self.serializer_classes[self.action]

    @action(methods=["get"], detail=True)
    def get_player(
        self, request, pk=None
    ):  # pylint: disable=unused-argument,invalid-name
        """
        Action for retrieving player details
        """
        room = self.get_object()
        player = room.player

        serializer = self.get_serializer(player)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=["patch"], detail=True)
    def update_player(
        self, request, pk=None
    ):  # pylint: disable=unused-argument,invalid-name
        """
        Action for updating player state and current_time
        """
        room = self.get_object()
        player = room.player

        host_chat_session = player.host
        session = Session.objects.get(pk=request.session.session_key)
        request_session_query = session.chat_sessions.filter(id=host_chat_session.id)
        if not request_session_query.exists():
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(player, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        if "state" in request.data:
            serializer_data = serializer.data
            room_prefix = (
                GroupPrefix.GROUP_ROOM
                if self.is_group_room
                else GroupPrefix.INDIVIDUAL_ROOM
            )
            channel_layer.group_send(
                room_prefix + str(room.id),
                MessageType.PLAYER_SYNC,
                {
                    "video_id": serializer_data.get("video_id"),
                    "state": serializer_data.get("state"),
                    "current_time": serializer_data.get("current_time"),
                },
            )
        return Response(status=status.HTTP_200_OK)


class IndividualRoomViewSet(RoomViewSet):  # pylint: disable=too-many-ancestors
    """
    API endpoint for individual room
    """

    queryset = IndividualRoom.objects.all()
    permission_classes = [IndividualRoomPermission]

    @property
    def is_group_room(self):
        return False


class GroupRoomViewSet(RoomViewSet):  # pylint: disable=too-many-ancestors
    """
    API endpoint that allows group rooms to be created, viewed, listed, edited & deleted.
    """

    queryset = GroupRoom.objects.all()
    permission_classes = [GroupRoomPermission]
    serializer_classes = RoomViewSet.serializer_classes | {
        "retrieve": RetrieveGroupRoomSerializer,
    }

    @property
    def is_group_room(self):
        return True

    def get_serializer_class(self, *args, **kwargs):
        if self.action in self.serializer_classes:
            return super().get_serializer_class()
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

    @action(methods=["get"], detail=True, permission_classes=[AllowAny])
    def get_player(self, request, pk=None):
        group_room = self.get_object()
        request_password = request.META.get("HTTP_X_GROUP_PASSWORD", "")
        password_valid = (
            check_password(request_password, group_room.password)
            if group_room.is_protected
            else True
        )
        return (
            super().get_player(request, pk=pk)
            if password_valid
            else Response(status=status.HTTP_403_FORBIDDEN)
        )

    @action(methods=["get"], detail=True, permission_classes=[AllowAny])
    def check_password(
        self, request, pk=None
    ):  # pylint: disable=unused-argument,invalid-name
        """
        action for checking group room password
        """
        group_room = self.get_object()
        request_password = request.META.get("HTTP_X_GROUP_PASSWORD", "")
        password_valid = check_password(request_password, group_room.password)
        return (
            Response(status=status.HTTP_200_OK)
            if password_valid
            else Response(status=status.HTTP_400_BAD_REQUEST)
        )
