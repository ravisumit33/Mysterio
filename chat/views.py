from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework import permissions
from chat.serializers import GroupRoomSerializer
from chat.models import GroupRoom


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
    permission_classes = [permissions.IsAuthenticated]
