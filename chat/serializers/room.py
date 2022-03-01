import logging
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from chat.models import GroupRoom
from .player import PlayerSerializer


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
        return group_room.messages.count()

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

    admin_access = serializers.SerializerMethodField()

    is_creator = serializers.SerializerMethodField()

    is_favorite = serializers.SerializerMethodField()

    player = PlayerSerializer(read_only=True)

    messages = serializers.SerializerMethodField()

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

    def get_messages(self, group_room):
        """
        Return url to get paginated messages for group room
        """
        room_pk = group_room.pk
        request = self.context.get("request")
        view = self.context.get("view")
        return view.reverse_action("get-messages", args=[room_pk])

    class Meta:
        model = GroupRoom
        fields = [
            "admin_access",
            "is_creator",
            "is_favorite",
            "player",
            "name",
            "avatar_url",
            "messages",
        ]
