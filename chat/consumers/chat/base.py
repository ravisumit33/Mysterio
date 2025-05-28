import logging

from channels.exceptions import DenyConnection
from channels.generic.websocket import JsonWebsocketConsumer

from chat.constants import ChannelLayerPrefix
from chat.consumers.utils import create_instance
from chat.models import MessageType, Room, RoomType
from chat.serializers import MessagePolymorphicSerializer
from chat.tasks import IndividualRoomDeletor
from chat.utils import channel_layer

logger = logging.getLogger(__name__)


class BaseChatConsumer(JsonWebsocketConsumer):
    clayer_prefix_map = {
        RoomType.GROUP: ChannelLayerPrefix.GROUP_ROOM,
        RoomType.INDIVIDUAL: ChannelLayerPrefix.INDIVIDUAL_ROOM,
    }

    def __init__(self, *args, **kwargs):
        self.room_type = None
        self.room_id = None
        self.clayer_room_prefix = None
        self.profile = {}

    @property
    def is_group_consumer(self):
        return self.room_type == RoomType.GROUP

    def get_room_instance(self):
        return Room.objects.get(pk=self.room_id)

    def send_message(self, msg_type, data):
        channel_layer.send_message(self.channel_name, msg_type, data)

    def add_text_message(self, text, msg_type, fail_action=None):
        """
        Add entry to textdata and message models
        """
        try:
            create_instance(
                MessagePolymorphicSerializer,
                {
                    "text": text,
                    "room": self.room_id,
                    "sender": self.profile,
                    "message_type": msg_type,
                },
            )
        except Exception as excp:
            logger.error("Failed to add text message")
            logger.exception(excp)
            if fail_action is not None:
                fail_action()
            else:
                raise excp

    def broadcast_message(self, msg_type, data):
        channel_layer.group_send_message(
            self.clayer_room_prefix + str(self.room_id), msg_type, data
        )

    def initialize_connection(self):
        session = self.scope["session"]
        if session.session_key is None:
            logger.error("SuspiciousOperation: WebSocket connection without session")
            raise DenyConnection
        url_kwargs = self.scope["url_route"]["kwargs"]
        if "room_id" in url_kwargs:
            room_type = url_kwargs["room_type"]
            try:
                self.clayer_room_prefix = self.clayer_prefix_map[room_type]
            except KeyError:
                logger.error("SuspiciousOperation: Invalid room type")
                raise DenyConnection
            self.room_type = room_type
            self.room_id = url_kwargs["room_id"]
            channel_layer.group_add(self.clayer_room_prefix + str(self.room_id), self.channel_name)
        else:
            self.room_type = RoomType.INDIVIDUAL

    def connect(self):
        self.accept()

    def receive_json(self, content, **kwargs):
        message_type = content["type"]
        message_data = content["data"]
        if message_type == MessageType.USER_INFO:
            name = message_data["name"]
            avatar_url = message_data["avatarUrl"] if "avatarUrl" in message_data else ""
            client_session_id = message_data["sessionId"]
            self.profile = {
                "session_id": client_session_id,
                "name": name,
                "avatar_url": avatar_url,
            }
        elif message_type == MessageType.TEXT:
            self.broadcast_message(
                MessageType.TEXT, {"content": message_data["text"], "sender": self.profile}
            )

    def disconnect(self, code):
        if self.room_id:
            channel_layer.group_discard(
                self.clayer_room_prefix + str(self.room_id), self.channel_name
            )
            if not self.is_group_consumer:
                # Indiviual Room is scheduled to be deleted.
                # This is done to counter if user has disconnected due to network issues
                # and can rejoin within CHAT_SESSION_DELETION_DELAY
                # If the user doesn't join, room will be deleted and other user will be notified
                IndividualRoomDeletor.schedule_deletion(self.room_id)
            logger.info("Room deleted. Id: %d", self.room_id)
