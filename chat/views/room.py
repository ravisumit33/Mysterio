from rest_framework import filters, status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from chat.constants import GroupPrefix, MessageType
from chat.models import Room
from chat.permissions import RoomPermission
from chat.serializers import (
    DefaultRoomSerializer,
    RetrieveRoomSerializer,
)
from chat.utils import channel_layer, check_group_room_password


class RoomViewSet(viewsets.ModelViewSet):
    """
    Viewset for rooms
    """

    queryset = Room.objects.all()
    serializer_classes = {
        "retrieve": RetrieveRoomSerializer,
    }
    permission_classes = [RoomPermission]
    filter_backends = [filters.SearchFilter]
    search_fields = ["room_type"]

    def get_serializer_class(self, *args, **kwargs):
        if self.action in self.serializer_classes:
            return self.serializer_classes[self.action]
        return DefaultRoomSerializer

    def destroy(self, request, *args, **kwargs):
        room = self.get_object()
        group_prefix = GroupPrefix.GROUP_ROOM if room.is_group_room else GroupPrefix.INDIVIDUAL_ROOM
        channel_layer.group_send(
            group_prefix + str(room.id),
            MessageType.CHAT_DELETE,
            {
                "text": "Room is deleted",
            },
        )
        return super().destroy(request, *args, **kwargs)

    @action(methods=["get"], detail=True, permission_classes=[AllowAny])
    def is_protected(self, request, pk=None):
        """
        action for checking if room is protected
        """
        group_room = self.get_object()
        room_data = group_room.room_data
        return Response(
            {
                "is_protected": room_data.is_protected,
                "name": room_data.name,
                "avatar_url": room_data.avatar_url,
            },
            status=status.HTTP_200_OK,
        )

    @action(methods=["get"], detail=True, permission_classes=[AllowAny])
    def check_password(self, request, pk=None):
        """
        action for checking room password
        """
        group_room = self.get_object()
        password_valid = check_group_room_password(request, group_room.room_data)
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
    favorite_room_data = request.user.favorite_room_data.all()
    favorite_rooms = [room_data.room for room_data in favorite_room_data]
    return DefaultRoomSerializer(favorite_rooms, many=True).data
