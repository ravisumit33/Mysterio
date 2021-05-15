from rest_framework import serializers
from chat.models import GroupRoom


class GroupRoomSerializer(serializers.HyperlinkedModelSerializer):
    """
    Serializer for group room API endpoint
    """

    class Meta:
        model = GroupRoom
        fields = ["name", "id", "created_at"]
