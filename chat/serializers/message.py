from rest_framework import serializers
from chat.models import TextMessage
from .channel import GroupChannelSerializer


class TextMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for messages
    """

    sender_channel = GroupChannelSerializer(read_only=True)

    class Meta:
        model = TextMessage
        fields = ["sender_channel", "text", "message_type"]
