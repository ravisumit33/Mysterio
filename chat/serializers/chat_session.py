from rest_framework import serializers
from chat.models import ChatSession


class ChatSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for getting chat session data
    """

    session_id = serializers.SerializerMethodField()

    def get_session_id(self, chat_session):  # pylint: disable=no-self-use
        """
        Get session id from chat session
        """
        return chat_session.tab_session_id

    class Meta:
        model = ChatSession
        fields = ["id", "session_id", "name", "avatar_url", "pub_key"]
