from rest_framework import viewsets
from chat.serializers import GroupRoomSerializer
from chat.models import GroupRoom
from chat.permissions import GroupRoomPermission


class GroupRoomViewSet(viewsets.ModelViewSet):  # pylint: disable=too-many-ancestors
    """
    API endpoint that allows group rooms to be created, viewed, listed, edited & deleted.
    """

    queryset = GroupRoom.objects.all()
    serializer_class = GroupRoomSerializer
    permission_classes = [GroupRoomPermission]
