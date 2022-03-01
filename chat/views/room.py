from rest_framework import status, pagination
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from rest_framework.permissions import AllowAny
from chat.models.room import IndividualRoom
from chat.serializers import (
    DefaultGroupRoomSerializer,
    RetrieveGroupRoomSerializer,
)
from chat.models import GroupRoom
from chat.permissions import GroupRoomPermission, IndividualRoomPermission
from chat.constants import MESSAGE_PAGE_SIZE, GroupPrefix, MessageType
from chat.serializers.message import MessageSerializer
from chat.utils import channel_layer, check_group_password
from .base import RoomViewSet


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
    API endpoint that for group room
    """

    queryset = GroupRoom.objects.all()
    permission_classes = [GroupRoomPermission]
    serializer_classes = RoomViewSet.serializer_classes | {
        "retrieve": RetrieveGroupRoomSerializer,
        "get_messages": MessageSerializer,
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

    @action(methods=["post"], detail=True)
    def set_like(
        self, request, pk=None
    ):  # pylint: disable=invalid-name,unused-argument
        """
        Action to like group room
        """
        like = request.data.get("like", None)
        if like is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        group_room = self.get_object()
        if like:
            group_room.likers.add(request.user)
        else:
            group_room.likers.remove(request.user)
        return Response(status=status.HTTP_200_OK)

    @action(methods=["get"], detail=True)
    def get_messages(
        self, request, pk=None
    ):  # pylint: disable=unused-argument,invalid-name
        """
        Action for getting messages of group room
        """
        group_room = self.get_object()
        messages = group_room.messages.order_by("-sent_at")
        paginator = pagination.PageNumberPagination()
        paginator.page_size = MESSAGE_PAGE_SIZE
        page = paginator.paginate_queryset(messages, request, view=self)
        serializer = self.get_serializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @action(methods=["get"], detail=True, permission_classes=[AllowAny])
    def check_password(
        self, request, pk=None
    ):  # pylint: disable=unused-argument,invalid-name
        """
        Action for checking group room password
        """
        group_room = self.get_object()
        password_valid = check_group_password(request, group_room)
        return (
            Response(status=status.HTTP_200_OK)
            if password_valid
            else Response(status=status.HTTP_400_BAD_REQUEST)
        )


@api_view(["GET"])
def get_favorite_rooms(request):
    """
    Get all rooms marked as favorite by user
    """
    favorite_rooms = request.user.favorite_rooms.all()
    return DefaultGroupRoomSerializer(favorite_rooms, many=True).data
