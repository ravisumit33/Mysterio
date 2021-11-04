from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from chat.models import GroupRoom, TextMessage, GroupChannel, ChatSession


class ChatSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for getting chat session data
    """

    class Meta:
        model = ChatSession
        fields = ["session_id", "name", "avatar_url"]


class GroupChannelSerializer(serializers.ModelSerializer):
    """
    Serializer for group_channels API endpoint
    """

    session = ChatSessionSerializer(read_only=True)

    class Meta:
        model = GroupChannel
        fields = ["session"]


class MessageSerializer(serializers.HyperlinkedModelSerializer):
    """
    Serializer for messages API endpoint
    """

    sender_channel = GroupChannelSerializer(read_only=True)

    class Meta:
        model = TextMessage
        fields = ["sender_channel", "text", "message_type"]


class GroupRoomPasswordSerializer(serializers.ModelSerializer):
    """
    Serialize password field of group room model
    """

    password = serializers.CharField(max_length=128, write_only=True, allow_blank=True)

    class Meta:
        model = GroupRoom
        fields = ["password"]


class DefaultGroupRoomSerializer(GroupRoomPasswordSerializer):
    """
    Base serializer for group rooms API endpoint
    """

    zscore = serializers.FloatField(read_only=True)

    message_count = serializers.SerializerMethodField(read_only=True)

    is_protected = serializers.SerializerMethodField(read_only=True)

    def get_message_count(self, group_room):  # pylint: disable=no-self-use
        """
        Getter function for message_count serializer field
        """
        return group_room.group_messages.count()

    def get_is_protected(self, group_room):  # pylint: disable=no-self-use
        """
        Getter function for is_protected serializer method field
        """
        return bool(group_room.password)

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        instance = super().create(validated_data)
        instance.admin = self.context.get("request").user
        if password:
            instance.password = make_password(password)
        instance.save()
        return instance

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        instance = super().update(instance, validated_data)
        if password:
            instance.password = make_password(password)
        instance.save()
        return instance

    class Meta(GroupRoomPasswordSerializer.Meta):
        fields = GroupRoomPasswordSerializer.Meta.fields + [
            "id",
            "name",
            "zscore",
            "is_protected",
            "message_count",
        ]


class RetrieveGroupRoomSerializer(DefaultGroupRoomSerializer):
    """
    Serializer for group room API endpoint
    """

    group_messages = serializers.SerializerMethodField(read_only=True)

    def get_group_messages(self, group_room):  # pylint: disable=no-self-use
        """
        Provide group messageds sorted by sent_at
        """
        messages = group_room.group_messages.order_by("sent_at")
        return MessageSerializer(messages, many=True).data

    class Meta(DefaultGroupRoomSerializer.Meta):
        fields = DefaultGroupRoomSerializer.Meta.fields + ["group_messages"]
