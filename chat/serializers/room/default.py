from django.contrib.auth.hashers import make_password
from drf_spectacular.utils import PolymorphicProxySerializer, extend_schema_field
from rest_framework import serializers

from chat.models import GroupRoomData, Room, RoomType
from chat.serializers.chat_session import ChatSessionSerializer
from chat.serializers.polymorphic_field_serializer import PolymorphicFieldSerializer


class DefaultGroupRoomDataSerializer(serializers.ModelSerializer):
    """
    Default serializer for group room data
    """

    type = serializers.CharField(default=RoomType.GROUP, read_only=True)
    favorite = serializers.BooleanField(write_only=True, required=False)

    def create(self, validated_data):
        room = validated_data.pop("room", None)
        password = validated_data.pop("password", None)
        user = self.context.get("request").user
        validated_data["creator"] = user
        instance = super().create(validated_data)
        instance.admins.add(user)
        instance.likers.add(user)
        if password:
            instance.password = make_password(password)
        instance.room = room
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


@extend_schema_field(
    PolymorphicProxySerializer(
        component_name="DefaultRoomData",
        serializers=[DefaultGroupRoomDataSerializer],
        resource_type_field_name="type",
    )
)
class DefaultRoomDataSerializer(PolymorphicFieldSerializer):
    discriminator_field = "room_type"
    serializer_map = {RoomType.GROUP: DefaultGroupRoomDataSerializer}


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
        online_users = room.channels.filter(is_active=True).select_related("chat_session")
        serializer = ChatSessionSerializer(online_users, many=True)
        return serializer.data

    def get_message_count(self, room):
        """
        Getter function for message_count serializer field
        """
        return room.messages.count()

    def create(self, validated_data):
        room_data = validated_data.pop("room_data")
        room = super().create(validated_data)
        self.fields.get("room_data").create({"room": room, **room_data})
        return room

    def update(self, instance, validated_data):
        room_data = validated_data.pop("room_data")
        instance = super().update(instance, validated_data)
        self.fields.get("room_data").update(instance.room_data, room_data)
        return instance

    def get_fields(self):
        fields = super().get_fields()
        room_type = None
        if self.instance:
            room_type = getattr(self.instance, "room_type", None)
        elif hasattr(self, "initial_data") and isinstance(self.initial_data, dict):
            room_type = self.initial_data.get("room_type")
        fields["room_data"].context.update({"room_type": room_type})
        return fields

    class Meta:
        model = Room
        fields = ["id", "message_count", "room_data", "online_users", "room_type"]
        extra_kwargs = {"room_type": {"write_only": True}}
