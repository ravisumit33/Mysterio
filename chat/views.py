from django.contrib.auth.hashers import check_password
from django.http import HttpResponse, JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from chat.serializers import BaseGroupRoomSerializer, ExtendedGroupRoomSerializer
from chat.models import GroupRoom
from chat.permissions import GroupRoomPermission
from chat.constants import GroupPrefix, MessageType
from chat.utils import channel_layer


class GroupRoomViewSet(viewsets.ModelViewSet):  # pylint: disable=too-many-ancestors
    """
    API endpoint that allows group rooms to be created, viewed, listed, edited & deleted.
    """

    queryset = GroupRoom.objects.all()
    permission_classes = [GroupRoomPermission]

    def get_serializer_class(self, *args, **kwargs):
        if self.action == "list":
            return BaseGroupRoomSerializer
        return ExtendedGroupRoomSerializer

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


@api_view(["POST"])
@permission_classes([AllowAny])
def check_group_password(request):
    """
    API endpoint to check password for group rooms
    """
    post_data = request.data
    group_id = post_data["id"]
    group_password = post_data["password"]

    try:
        group_room = GroupRoom.objects.get(id=group_id)
    except GroupRoom.DoesNotExist:
        return HttpResponse(status=400)
    if group_room.is_protected and group_password == "":
        return JsonResponse({"check": False, "password": ["This field is required."]})
    return JsonResponse({"check": check_password(group_password, group_room.password)})
