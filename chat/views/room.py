from rest_framework import filters, viewsets
from rest_framework.decorators import api_view

from chat.constants import GroupPrefix, MessageType
from chat.models import Room
from chat.permissions import RoomPermission
from chat.serializers import (
    DefaultRoomSerializer,
    RetrieveRoomSerializer,
)
from chat.utils import channel_layer


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


@api_view(["GET"])
def get_favorite_rooms(request):
    """
    Get all rooms marked as favorite by user
    """
    favorite_room_data = request.user.favorite_room_data.all()
    favorite_rooms = [room_data.room for room_data in favorite_room_data]
    return DefaultRoomSerializer(favorite_rooms, many=True).data
