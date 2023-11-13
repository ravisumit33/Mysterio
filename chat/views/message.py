from rest_framework import filters, viewsets

from chat.models import Message
from chat.paginations import MessagePagination
from chat.permissions import MessagePermission
from chat.serializers import ReadMessageSerializer, WriteMessageSerializer


class MessageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Viewset for messages
    """

    queryset = Message.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["room__id"]
    ordering_fields = ["sent_at"]
    permission_classes = [MessagePermission]
    pagination_class = MessagePagination

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return WriteMessageSerializer
        return ReadMessageSerializer
