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


class GroupRoomSerializer(serializers.ModelSerializer):
    """
    Serializer for group room API endpoint
    """

    group_messages = serializers.SerializerMethodField(read_only=True)

    zscore = serializers.FloatField(read_only=True)

    password = serializers.CharField(write_only=True, allow_blank=True)

    message_count = serializers.SerializerMethodField(read_only=True)

    def get_message_count(self, group_room):  # pylint: disable=no-self-use
        """
        Getter function for group messages serializer fields
        """
        return group_room.group_messages.count()

    def get_group_messages(self, group_room):
        """
        Getter function for group_messages serializer field
        """
        view = self.context.get("view")
        if view.action == "list" and group_room.is_protected:
            return "Hidden for protected groups"
        request = self.context.get("request")
        serializer_context = {"request": request}
        messages = TextMessage.objects.filter(group_room=group_room)
        serializer = MessageSerializer(messages, many=True, context=serializer_context)
        return serializer.data

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
        fields = [
            "id",
            "name",
            "password",
            "group_messages",
            "zscore",
            "is_protected",
            "message_count",
        ]
