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


class BaseGroupRoomSerializer(serializers.ModelSerializer):
    """
    Base serializer for group rooms API endpoint
    """

    zscore = serializers.FloatField(read_only=True)

    password = serializers.CharField(write_only=True, allow_blank=True)

    message_count = serializers.SerializerMethodField(read_only=True)

    def get_message_count(self, group_room):  # pylint: disable=no-self-use
        """
        Getter function for group messages serializer fields
        """
        return group_room.group_messages.count()

    class Meta:
        model = GroupRoom
        fields = [
            "id",
            "name",
            "password",
            "zscore",
            "is_protected",
            "message_count",
        ]


class ExtendedGroupRoomSerializer(BaseGroupRoomSerializer):
    """
    Serializer for group room API endpoint
    """

    group_messages = serializers.SerializerMethodField(read_only=True)

    def get_group_messages(self, group_room):  # pylint: disable=no-self-use
        """
        Sort group messages in decreasing order of sent_at
        """
        messages = group_room.group_messages.order_by("sent_at")
        return MessageSerializer(messages, many=True).data

    def create(self, validated_data):
        is_protected = validated_data.pop("is_protected", None)
        password = validated_data.pop("password", None)
        instance = self.Meta.model(**validated_data)
        instance.admin = self.context.get("request").user
        if is_protected and ((not password) or (password == "")):
            raise serializers.ValidationError({"password": ["This field is required."]})

        if is_protected:
            instance.is_protected = True
            instance.password = make_password(password)
        instance.save()
        return instance

    class Meta:
        model = GroupRoom
        fields = BaseGroupRoomSerializer.Meta.fields + ["group_messages"]
