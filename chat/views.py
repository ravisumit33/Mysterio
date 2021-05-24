from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from chat.serializers import GroupRoomSerializer
from chat.models import GroupRoom


class GroupRoomViewSet(viewsets.ModelViewSet):  # pylint: disable=too-many-ancestors
    """
    API endpoint that allows group rooms to be viewed or edited.
    """

    queryset = GroupRoom.objects.all()
    serializer_class = GroupRoomSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
