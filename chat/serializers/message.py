from rest_framework import serializers

from chat.models import Message, TextData

from .channel import ReadChannelSerializer


class TextDataSerializer(serializers.ModelSerializer):
    """
    Serializer for text data
    """

    class Meta:
        model = TextData
        fields = ["text"]


class MessageContentField(serializers.Field):
    """
    A custom field to use for the content_object generic relationship on Message model
    """

    def to_representation(self, value):
        if isinstance(value, TextData):
            return TextDataSerializer(value, context=self.context).data
        raise Exception("Unexpected type of message content_object")

    def to_internal_value(self, data):
        if data.get("text", None):
            return TextDataSerializer(data=data, context=self.context).to_internal_value(data)
        raise serializers.ValidationError("Invalid message content")

    def get_queryset(self, data):
        if data.get("text", None):
            return TextData.objects.all()
        raise serializers.ValidationError("Invalid message content")


class WriteMessageSerializer(serializers.ModelSerializer):
    """
    Write serializer for messages
    """

    content = MessageContentField(source="content_object")

    def create(self, validated_data):
        """
        Create message object
        """
        content_data = validated_data.pop("content_object")
        content_object_qs = self.fields["content"].get_queryset(content_data)
        content_object = content_object_qs.create(**content_data)
        message = Message.objects.create(**validated_data, content_object=content_object)
        return message

    class Meta:
        model = Message
        fields = ["sender_channel", "room", "message_type", "content"]
        extra_kwargs = {
            "sender_channel": {"write_only": True},
            "room": {"write_only": True},
            "message_type": {"write_only": True},
            "content": {"write_only": True},
        }


class ReadMessageSerializer(serializers.ModelSerializer):
    """
    Read serializer for messages
    """

    content = MessageContentField(source="content_object", read_only=True)
    sender_channel = ReadChannelSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ["room", "message_type", "sender_channel", "content"]
