import logging

from django.contrib.auth.hashers import make_password
from rest_framework import serializers

from chat.models import GroupRoomData, Room, RoomType
from chat.serializers import ReadChannelSerializer

from .player import ReadPlayerSerializer

logger = logging.getLogger(__name__)


class DefaultGroupRoomDataSerializer(serializers.ModelSerializer):
    """
    Default serializer for group room data
    """

    favorite = serializers.BooleanField(write_only=True, required=False)

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
        favorite = validated_data.pop("favorite", None)
        instance = super().update(instance, validated_data)
        if password:
            instance.password = make_password(password)
        if favorite is not None:
            user = self.context.get("request").user
            if favorite:
                instance.likers.add(user)
            else:
                instance.likers.remove(user)
        instance.save()
        return instance

    class Meta:
        model = GroupRoomData
        fields = [
            "name",
            "description",
            "avatar_url",
            "password",
            "zscore",
            "is_protected",
            "favorite",
        ]
        read_only_fields = ["zscore"]
        extra_kwargs = {"password": {"write_only": True, "max_length": 20}}


class DefaultRoomDataSerializer(serializers.Serializer):
    def get_data_serializer(self, room_type, instance=None, data=None):
        kwargs = {"context": self.context, "partial": self.root.partial}
        if instance is not None:
            kwargs["instance"] = instance
        if data is not None:
            kwargs["data"] = data
        if room_type == RoomType.GROUP:
            return DefaultGroupRoomDataSerializer(**kwargs)
        return None

    def to_representation(self, instance):
        data_serializer = self.get_data_serializer(instance.room.room_type, instance=instance)
        return data_serializer.data if data_serializer else {}

    def get_value(self, dictionary):
        field_dict = super().get_value(dictionary)
        if room := self.root.instance:
            room_type = room.room_type
        else:
            room_type = field_dict.get("room_type")
        return {**field_dict, "room_type": room_type}

    def to_internal_value(self, data):
        room_type = data.get("room_type")
        data_serializer = self.get_data_serializer(room_type, data=data)
        if data_serializer is not None and data_serializer.is_valid():
            return data_serializer.validated_data
        else:
            error = data_serializer.errors if data_serializer else "Invalid room data"
            raise serializers.ValidationError(error)

    def create(self, validated_data):
        room_type = validated_data.pop("room_type")
        data_serializer = self.get_data_serializer(room_type, data=validated_data)
        return data_serializer.create(validated_data) if data_serializer else None

    def update(self, instance, validated_data):
        room_type = validated_data.pop("room_type")
        data_serializer = self.get_data_serializer(
            room_type, instance=instance, data=validated_data
        )
        return data_serializer.update(instance, validated_data) if data_serializer else None


class DefaultRoomSerializer(serializers.ModelSerializer):
    """
    Default serializer for rooms
    """

    message_count = serializers.SerializerMethodField()

    online_users = serializers.SerializerMethodField()

    room_data = DefaultRoomDataSerializer()

    def get_online_users(self, room):
        """
        Getter function for online_users serializer field
        """
        online_users = room.channels.filter(is_active=True)
        serializer = ReadChannelSerializer(online_users, many=True)
        return serializer.data

    def get_message_count(self, room):
        """
        Getter function for message_count serializer field
        """
        return room.messages.count()

    def create(self, validated_data):
        room_data = validated_data.pop("room_data")
        room_type = validated_data.get("room_type")
        room = super().create(validated_data)
        self.fields.get("room_data").create(
            {"room_type": room_type, "room_id": room.id, **room_data}
        )
        return room

    def update(self, room, validated_data):
        room_data = validated_data.pop("room_data")
        validated_data.pop("room_type", None)  # room_type is not updatable
        room = super().update(room, validated_data)
        self.fields.get("room_data").update(
            room.room_data, {"room_type": room.room_type, **room_data}
        )
        return room

    class Meta:
        model = Room
        fields = ["id", "message_count", "room_data", "online_users", "room_type"]


class RetrieveGroupRoomDataSerializer(serializers.ModelSerializer):
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

    class Meta:
        model = GroupRoomData
        fields = [
            "admin_access",
            "is_creator",
            "is_favorite",
            "avatar_url",
            "name",
            "description",
        ]


class RetrieveRoomSerializer(serializers.ModelSerializer):
    """Base serializer for retrieve action of room API endpoint"""

    player = ReadPlayerSerializer(read_only=True)

    room_data = serializers.SerializerMethodField()

    def get_room_data(self, room):
        """
        Getter function for data serializer field
        """
        if room.is_group_room:
            return RetrieveGroupRoomDataSerializer(room.room_data, context=self.context).data
        return {}

    class Meta:
        model = Room
        fields = ["player", "room_data", "room_type"]
