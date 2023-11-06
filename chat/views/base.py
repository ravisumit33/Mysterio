from abc import abstractmethod

from django.contrib.sessions.models import Session
from rest_framework import pagination, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from chat.constants import MESSAGE_PAGE_SIZE, GroupPrefix, MessageType
from chat.serializers import PlayerSerializer
from chat.utils import channel_layer


class RoomViewSet(viewsets.ModelViewSet):
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
    def get_messages(self, request, pk=None):
        """
        Action for getting messages of room
        """
        room = self.get_object()
        messages = room.messages.order_by("-sent_at")
        paginator = pagination.PageNumberPagination()
        paginator.page_size = MESSAGE_PAGE_SIZE
        page = paginator.paginate_queryset(messages, request, view=self)
        serializer = self.get_serializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @action(methods=["get"], detail=True)
    def get_player(self, request, pk=None):
        """
        Action for retrieving player details
        """
        room = self.get_object()
        player = room.player
        if not player:
            return Response(status=status.HTTP_200_OK)
        serializer = self.get_serializer(player)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=["patch"], detail=True)
    def update_player(self, request, pk=None):
        """
        Action for updating player state and current_time
        """
        room = self.get_object()
        player = room.player
        host_chat_session = player.host
        session = Session.objects.get(pk=request.session.session_key)
        request_session_query = session.chat_sessions.filter(id=host_chat_session.id)
        if not request_session_query.exists():
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(player, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        if "state" in request.data:
            serializer_data = serializer.data
            room_prefix = (
                GroupPrefix.GROUP_ROOM if self.is_group_room else GroupPrefix.INDIVIDUAL_ROOM
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
