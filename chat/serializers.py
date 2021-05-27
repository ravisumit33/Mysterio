from django.contrib.sessions.models import Session
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from chat.models import GroupRoom, TextMessage, GroupChannel


class SessionSerializer(serializers.ModelSerializer):
    """
    Serializer for getting session data
    """

    data = serializers.SerializerMethodField()

    def get_data(self, session):  # pylint: disable=no-self-use
        """
        Getter function for data serializer field
        """
        required_session_fields = ["id", "name", "avatarUrl"]
        session_data = session.get_decoded()
        required_session_data = {}
        for field in required_session_fields:
            required_session_data[field] = session_data[field]
        return required_session_data

    class Meta:
        model = Session
        fields = ["data"]


class GroupChannelSerializer(serializers.ModelSerializer):
    """
    Serializer for group_channels API endpoint
    """

    session = SessionSerializer(read_only=True)

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

    group_messages = MessageSerializer(many=True, read_only=True)

    zscore = serializers.FloatField(read_only=True)

    password = serializers.CharField(write_only=True, allow_blank=True)

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        instance = self.Meta.model(**validated_data)
        instance.admin = self.context.get("request").user
        if password is not None:
            instance.is_protected = True
            instance.password = make_password(password)
        instance.save()
        return instance

    class Meta:
        model = GroupRoom
        fields = ["id", "name", "password", "group_messages", "zscore", "is_protected"]
