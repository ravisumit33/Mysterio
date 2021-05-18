from django.contrib.sessions.models import Session
from django.http import JsonResponse
from rest_framework import viewsets
from chat.serializers import (
    GroupRoomSerializer,
    MessageSerializer,
    GroupChannelSerializer,
    SessionSerializer,
)
from chat.models import GroupRoom, TextMessage, GroupChannel


def test_view(request):
    """Test chat api view"""
    response_data = {
        "id": 4,
        "name": "Hello world",
    }
    return JsonResponse(response_data)


class GroupRoomViewSet(viewsets.ModelViewSet):  # pylint: disable=too-many-ancestors
    """
    API endpoint that allows group rooms to be viewed or edited.
    """

    queryset = GroupRoom.objects.all()
    serializer_class = GroupRoomSerializer


class MessageViewSet(
    viewsets.ReadOnlyModelViewSet
):  # pylint: disable=too-many-ancestors
    """
    API endpoint that allows messages to be viewed.
    """

    queryset = TextMessage.objects.all().order_by("sent_at")
    serializer_class = MessageSerializer


class GroupChannelViewSet(
    viewsets.ReadOnlyModelViewSet
):  # pylint: disable=too-many-ancestors

    """
    API endpoint that allows group_channels to be viewed.
    """

    queryset = GroupChannel.objects.all()
    serializer_class = GroupChannelSerializer


class SessionViewSet(
    viewsets.ReadOnlyModelViewSet
):  # pylint: disable=too-many-ancestors

    """
    API endpoint that allows sessions to be viewed.
    """

    queryset = Session.objects.all()
    serializer_class = SessionSerializer
