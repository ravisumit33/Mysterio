from drf_spectacular.utils import PolymorphicProxySerializer, extend_schema_field
from rest_framework import serializers

from chat.models import GroupRoomData, Room, RoomType
from chat.serializers.player import ReadPlayerSerializer
from chat.serializers.polymorphic_field_serializer import PolymorphicFieldSerializer


class RetrieveGroupRoomDataSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieve action of group room API endpoint
    """

    type = serializers.CharField(default=RoomType.GROUP, read_only=True)
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
        read_only_fields = "__all__"


@extend_schema_field(
    PolymorphicProxySerializer(
        component_name="RetrieveRoomData",
        serializers=[RetrieveGroupRoomDataSerializer],
        resource_type_field_name="type",
    )
)
class RetrieveRoomDataSerializer(PolymorphicFieldSerializer):
    discriminator_field = "room_type"
    serializer_map = {RoomType.GROUP: RetrieveGroupRoomDataSerializer}
    pass


class RetrieveRoomSerializer(serializers.ModelSerializer):
    """Base serializer for retrieve action of room API endpoint"""

    player = ReadPlayerSerializer()

    room_data = RetrieveRoomDataSerializer()

    def get_fields(self):
        fields = super().get_fields()
        room_type = None
        if self.instance:
            room_type = getattr(self.instance, "room_type", None)
        elif self.initial_data:
            room_type = self.initial_data.get("room_type")
        fields["room_data"].context.update({"room_type": room_type})
        return fields

    class Meta:
        model = Room
        fields = ["player", "room_data", "room_type"]
        read_only_fields = "__all__"
