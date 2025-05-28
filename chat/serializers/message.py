from drf_spectacular.utils import PolymorphicProxySerializer, extend_schema_field
from rest_framework import serializers

from chat.models import TextData
from chat.models.message import MessageDataType
from chat.serializers.chat_session import ChatSessionSerializer
from chat.serializers.polymorphic_field_serializer import PolymorphicFieldSerializer


class TextDataSerializer(serializers.ModelSerializer):
    """
    Serializer for creating text data of message
    """

    type = serializers.CharField(default=MessageDataType.TEXT, read_only=True)

    def create(self, validated_data):
        message = validated_data.pop("message", None)
        instance = super().create(validated_data)
        instance.message = message
        instance.save()
        return instance

    class Meta:
        model = TextData
        fields = ["text"]


@extend_schema_field(
    PolymorphicProxySerializer(
        component_name="MessageData",
        serializers=[TextDataSerializer],
        resource_type_field_name="type",
    )
)
class MessageDataSerializer(PolymorphicFieldSerializer):
    discriminator_field = "type"
    serializer_map = {MessageDataType.TEXT: TextDataSerializer}


class MessageSerializer(serializers.Serializer):
    sender = ChatSessionSerializer()
    message_data = MessageDataSerializer()

    def create(self, validated_data):
        message_data = validated_data.pop("message_data")
        instance = super().create(validated_data)
        self.fields.get("message_data").create({"message": instance, **message_data})
        return instance

    def update(self, instance, validated_data):
        message_data = validated_data.pop("message_data")
        instance = super().update(instance, validated_data)
        self.fields.get("message_data").update(instance.message_data, message_data)
        return instance
