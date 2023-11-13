from rest_framework import serializers

from chat.models import Channel, Room

from .chat_session import ChatSessionSerializer


class WriteChannelSerializer(serializers.ModelSerializer):
    """
    Serializer to create/update channels
    """

    def validate(self, attrs):
        """
        Validate that no more than 2 active channels are attached to individual room
        """
        if self.instance and (related_room := self.instance.room):
            if (
                related_room.room_type == Room.INDIVIDUAL
                and related_room.channels.filter(is_active=True).count() >= 2
                and attrs.get("is_active", False)
            ):
                raise serializers.ValidationError("Room can only have 2 active channels")
        return attrs

    class Meta:
        model = Channel
        fields = ["chat_session", "name", "is_active", "room"]
        extra_kwargs = {
            "chat_session": {"write_only": True},
            "name": {"write_only": True},
            "is_active": {"write_only": True},
            "room": {"write_only": True},
        }


class ReadChannelSerializer(serializers.ModelSerializer):
    """
    Serializer to read channels
    """

    chat_session = ChatSessionSerializer(read_only=True)

    class Meta:
        model = Channel
        fields = ["chat_session"]
