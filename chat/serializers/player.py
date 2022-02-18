from rest_framework import serializers
from chat.models import Player
from .chat_session import ChatSessionSerializer


class PlayerSerializer(serializers.ModelSerializer):
    """
    Serializer for player
    """

    host = ChatSessionSerializer(read_only=True)

    class Meta:
        model = Player
        fields = [
            "name",
            "video_id",
            "host",
            "state",
            "current_time",
        ]
        read_only_fields = ["name", "host"]
