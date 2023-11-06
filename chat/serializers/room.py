import logging

from django.contrib.auth.hashers import make_password
from rest_framework import serializers

from chat.models import GroupRoom
from chat.models.room import IndividualRoom
from chat.serializers.channel import GroupChannelSerializer

from .player import PlayerSerializer

logger = logging.getLogger(__name__)


class DefaultRoomSerializer(serializers.ModelSerializer):
    """
    Base default serializer for rooms API endpoint
    """

    message_count = serializers.SerializerMethodField()

    def get_message_count(self, room):
        """
        Getter function for message_count serializer field
        """
        return room.messages.count()

    class Meta:
        fields = ["id", "name", "message_count"]


class DefaultIndividualRoomSerializer(DefaultRoomSerializer):
    """Default serializer for individual rooms API endpoints"""

    class Meta(DefaultRoomSerializer.Meta):
        model = IndividualRoom


class DefaultGroupRoomSerializer(DefaultRoomSerializer):
    """
    Base serializer for group rooms API endpoint
    """

    online_users = serializers.SerializerMethodField()

    def get_online_users(self, group_room):
        """
        Getter function for online_users serializer field
        """
        online_users = group_room.channels.filter(is_active=True)
        serializer = GroupChannelSerializer(online_users, many=True)
        return serializer.data

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = self.context.get("request").user
        validated_data["creator"] = user
        instance = super().create(validated_data)
        instance.admins.add(user)
        instance.likers.add(user)
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

    class Meta(DefaultRoomSerializer.Meta):
        model = GroupRoom
        fields = DefaultRoomSerializer.Meta.fields + [
            "description",
            "avatar_url",
            "password",
            "zscore",
            "is_protected",
            "online_users",
        ]
        read_only_fields = ["zscore"]
        extra_kwargs = {"password": {"write_only": True}}


class RetrieveRoomSerializer(serializers.ModelSerializer):
    """Base serializer for retrieve action of room API endpoint"""

    player = PlayerSerializer(read_only=True)

    messages = serializers.SerializerMethodField()

    def get_messages(self, group_room):
        """
        Return url to get paginated messages for group room
        """
        room_pk = group_room.pk
        view = self.context.get("view")
        return view.reverse_action("get-messages", args=[room_pk])

    class Meta:
        fields = ["name", "player", "messages"]


class RetrieveIndividualRoomSerializer(RetrieveRoomSerializer):
    """Serializer for retrieve action of IndividualRoom API endpoint"""

    class Meta(RetrieveRoomSerializer.Meta):
        model = IndividualRoom


class RetrieveGroupRoomSerializer(RetrieveRoomSerializer):
    """
    Serializer for retrieve action of group room API endpoint
    """

    admin_access = serializers.SerializerMethodField()

    is_creator = serializers.SerializerMethodField()

    is_favorite = serializers.SerializerMethodField()

    def get_admin_access(self, group_room):
        """
        Return true if request user had admin access
        """
        user = self.context.get("request").user
        return user in group_room.admins.all()

    def get_is_favorite(self, group_room):
        """
        Return true if request user has marked group room favorite
        """
        user = self.context.get("request").user
        return user in group_room.likers.all()

    def get_is_creator(self, group_room):
        """
        Return true if request user has created the group room
        """
        user = self.context.get("request").user
        return user is group_room.creator

    class Meta(RetrieveRoomSerializer.Meta):
        model = GroupRoom
        fields = RetrieveRoomSerializer.Meta.fields + [
            "admin_access",
            "is_creator",
            "is_favorite",
            "avatar_url",
        ]
