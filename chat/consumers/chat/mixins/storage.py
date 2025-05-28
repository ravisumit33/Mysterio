import logging

from channels.exceptions import DenyConnection

from chat.consumers.utils import create_instance, update_instance
from chat.models import Channel, MessageType
from chat.serializers import ChannelSerializer, ChatSessionSerializer

logger = logging.getLogger(__name__)


class StorageMixin:

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.channel_id = None
        self.chat_session_id = None
        self.connection_id = None

    def get_channel_instance(self):
        return Channel.objects.get(pk=self.channel_id)

    def initialize_connection(self):
        super().initialize_connection()
        try:
            channel = create_instance(
                ChannelSerializer,
                data={
                    "name": self.channel_name,
                    "room": self.room_id,
                },
            )
            self.channel_id = channel.id
            self.connection_id = channel.uuid
            logger.info("<<New channel created>>")
            logger.debug("Channel id: %d", self.channel_id)
        except Exception as excp:
            logger.error("Unable to create channel")
            logger.exception(excp)
            raise DenyConnection from excp

    def receive_json(self, content, **kwargs):
        super().receive_json(content, **kwargs)
        message_type = content["type"]
        message_data = content["data"]
        if message_type == MessageType.USER_INFO:
            name = message_data["name"]
            avatar_url = message_data["avatarUrl"] if "avatarUrl" in message_data else ""
            client_session_id = message_data["sessionId"]
            session_key = self.scope["session"].session_key
            chat_session = create_instance(
                ChatSessionSerializer,
                {
                    "name": name,
                    "client_session_id": client_session_id,
                    "avatar_url": avatar_url,
                    "session": session_key,
                    "channel": self.channel_id,
                },
            )
            self.chat_session_id = chat_session.id

    def disconnect(self, code):
        if not self.channel_id:
            return  # Connection close before channel object creation
        if self.room_id:
            update_instance(
                ChannelSerializer,
                self.get_channel_instance(),
                {"is_active": False},
            )  # Channel model will be deleted with room
        else:
            Channel.objects.filter(pk=self.channel_id).delete()
        logger.info("Channel deleted. Id: %d", self.channel_id)
        super().disconnect()
