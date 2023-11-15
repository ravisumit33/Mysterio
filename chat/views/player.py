from rest_framework import filters, mixins, viewsets

from chat.constants import GroupPrefix, MessageType
from chat.models import Player
from chat.permissions import PlayerPermission
from chat.serializers import ReadPlayerSerializer, UpdatePlayerSerializer
from chat.utils import channel_layer


class PlayerViewSet(mixins.ListModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    Viewset for player
    """

    queryset = Player.objects.all()
    filter_backends = [filters.SearchFilter]
    search_fields = ["room__id"]
    permission_classes = [PlayerPermission]

    def update(self, request, *args, **kwargs):
        resp = super().update(request, *args, **kwargs)
        if "state" in request.data:
            resp_data = resp.data
            room = self.get_object().room
            room_prefix = (
                GroupPrefix.GROUP_ROOM if room.is_group_room else GroupPrefix.INDIVIDUAL_ROOM
            )
            channel_layer.group_send(
                room_prefix + str(room.id),
                MessageType.PLAYER_SYNC,
                {
                    "video_id": resp_data.get("video_id"),
                    "state": resp_data.get("state"),
                    "current_time": resp_data.get("current_time"),
                },
            )
        return resp

    def get_serializer_class(self):
        if self.action == "list":
            return ReadPlayerSerializer
        return UpdatePlayerSerializer
