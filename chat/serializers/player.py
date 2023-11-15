from rest_framework import serializers

from chat.models import Player

from .chat_session import ChatSessionSerializer


class ReadPlayerSerializer(serializers.ModelSerializer):
    """
    serializer for listing players
    """

    host = ChatSessionSerializer(read_only=True)

    class Meta:
        model = Player
        fields = [
            "id",
            "name",
            "video_id",
            "host",
            "state",
            "current_time",
            "room",
        ]


class CreatePlayerSerializer(serializers.ModelSerializer):
    """
    serializer for creating player
    """

    class Meta:
        model = Player
        fields = [
            "name",
            "video_id",
            "host",
            "room",
        ]


class UpdatePlayerSerializer(serializers.ModelSerializer):
    """
    serializer for creating player
    """

    class Meta:
        model = Player
        fields = [
            "state",
            "current_time",
        ]
