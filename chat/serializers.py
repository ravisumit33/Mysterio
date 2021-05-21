from django.contrib.sessions.models import Session
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
        return session.get_decoded()

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

    group_room = serializers.HyperlinkedRelatedField(
        view_name="chat:grouproom-detail", read_only=True
    )
    sender_channel = GroupChannelSerializer(read_only=True)

    class Meta:
        model = TextMessage
        fields = ["group_room", "sender_channel", "sent_at", "text", "message_type"]


class GroupRoomSerializer(serializers.ModelSerializer):
    """
    Serializer for group room API endpoint
    """

    group_messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = GroupRoom
        fields = ["name", "id", "created_at", "group_messages", "zscore"]
