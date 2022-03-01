from rest_framework import serializers
from chat.models import Message, TextData
from .channel import GroupChannelSerializer


class MessageContentField(serializers.RelatedField):  # pylint:disable=abstract-method
    """
    A custom field to use for the content_object generic relationship on Message model
    """

    def to_representation(self, value):
        """
        Serialize message content objects to a simple textual representation.
        """
        if isinstance(value, TextData):
            return value.text
        raise Exception("Unexpected type of message content_object")


class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for messages
    """

    sender_channel = GroupChannelSerializer(read_only=True)

    content = MessageContentField(read_only=True, source="content_object")

    class Meta:
        model = Message
        fields = ["sender_channel", "message_type", "content"]
