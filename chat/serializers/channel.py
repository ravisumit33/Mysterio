from rest_framework import serializers
from chat.models import GroupChannel
from .chat_session import ChatSessionSerializer


class GroupChannelSerializer(serializers.ModelSerializer):
    """
    Serializer for group_channels
    """

    chat_session = ChatSessionSerializer(read_only=True)

    class Meta:
        model = GroupChannel
        fields = ["chat_session"]
