from rest_framework import serializers

from chat.models import ChatSession


class ChatSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for getting chat session data
    """

    session_id = serializers.SerializerMethodField()

    def get_session_id(self, chat_session):
        """
        Get session id from chat session
        """
        return chat_session.client_session_id

    class Meta:
        model = ChatSession
        fields = ["session_id", "name", "avatar_url", "session", "client_session_id"]
        extra_kwargs = {"session": {"write_only": True}, "client_session_id": {"write_only": True}}
