import logging
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from chat.models import GroupRoom
from .player import PlayerSerializer
from .message import TextMessageSerializer


logger = logging.getLogger(__name__)


class DefaultGroupRoomSerializer(serializers.ModelSerializer):
    """
    Base serializer for group rooms API endpoint
    """

    message_count = serializers.SerializerMethodField()

    def get_message_count(self, group_room):  # pylint: disable=no-self-use
        """
        Getter function for message_count serializer field
        """
        return group_room.textmessages.count()

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        instance = super().create(validated_data)
        instance.admins.add(self.context.get("request").user)
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

    class Meta:
        model = GroupRoom
        fields = [
            "id",
            "name",
            "avatar_url",
            "password",
            "zscore",
            "is_protected",
            "message_count",
        ]
        read_only_fields = ["zscore"]
        extra_kwargs = {"password": {"write_only": True}}


class RetrieveGroupRoomSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieve action of group room API endpoint
    """

    group_messages = serializers.SerializerMethodField()

    admin_access = serializers.SerializerMethodField()

    player = PlayerSerializer(read_only=True)

    def get_group_messages(self, group_room):  # pylint: disable=no-self-use
        """
        Provide group messageds sorted by sent_at
        """
        # TODO: Only text messages are supported currently
        messages = group_room.textmessages.order_by("sent_at")
        return TextMessageSerializer(messages, many=True).data

    def get_admin_access(self, group_room):
        """
        Return true if request user had admin access
        """
        user = self.context.get("request").user
        return user in group_room.admins.all()

    class Meta:
        model = GroupRoom
        fields = [
            "group_messages",
            "admin_access",
            "player",
        ]
