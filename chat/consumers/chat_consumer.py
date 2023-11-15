import json
import logging

from channels.exceptions import DenyConnection
from channels.generic.websocket import WebsocketConsumer

from chat.constants import CHAT_SESSION_DELETION_DELAY, GroupPrefix, MessageType
from chat.consumers.handlers.message import add_text_message
from chat.models import Channel, Room, RoomType
from chat.models.match_request import MatchRequest
from chat.serializers import WriteChannelSerializer
from chat.tasks import individual_room_timeout
from chat.utils import channel_layer

from .handlers import (
    handle_player_end,
    handle_player_info,
    handle_text_message,
    handle_user_info,
)
from .utils import create_instance, update_instance

logger = logging.getLogger(__name__)


class ChatConsumer(WebsocketConsumer):
    """Custom WebsocketConsumer for handling chat web socket requests"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.channel_id = None  # Id of channel model
        self.room_id = None  # Id of room model
        self.player_id = None  # Id of player model if this channel is host
        self.chat_session_id = None  # Id of ChatSession model related to this channel
        self.profile = {}
        self.channel_layer_info = {}

    def get_channel_instance(self):
        return Channel.objects.get(pk=self.channel_id)

    def get_room_instance(self):
        return Room.objects.get(pk=self.room_id)

    def connect(self):
        session = self.scope["session"]
        if session.session_key is None:
            logger.error("SuspiciousOperation: WebSocket connection without session")
            raise DenyConnection
        if "room_id" in (url_kwargs := self.scope["url_route"]["kwargs"]):
            self.room_id = url_kwargs["room_id"]
            room_type = url_kwargs["room_type"]
            if room_type == RoomType.GROUP:
                is_group_consumer = True
            elif room_type == RoomType.INDIVIDUAL:
                is_group_consumer = False
            else:
                logger.error("SuspiciousOperation: Invalid room type")
                raise DenyConnection
        else:
            is_group_consumer = False
        try:
            channel = create_instance(
                WriteChannelSerializer,
                data={
                    "name": self.channel_name,
                    "room": self.room_id,
                },
            )
            self.channel_id = channel.id
        except Exception as excp:
            logger.error("Unable to create channel")
            logger.exception(excp)
            raise DenyConnection from excp
        self.channel_layer_info = {
            "is_group_consumer": is_group_consumer,
            "group_prefix": (
                GroupPrefix.GROUP_ROOM if is_group_consumer else GroupPrefix.INDIVIDUAL_ROOM
            ),
            "group_prefix_channel": (
                GroupPrefix.GROUP_CHANNEL if is_group_consumer else GroupPrefix.INDIVIDUAL_CHANNEL
            ),
        }
        channel_layer.group_add(
            self.channel_layer_info["group_prefix_channel"] + str(self.channel_id),
            self.channel_name,
        )
        if self.room_id is not None:
            channel_layer.group_add(
                self.channel_layer_info["group_prefix"] + str(self.room_id), self.channel_name
            )
            logger.info("Room type: %s, id: %d", url_kwargs["room_type"], self.room_id)
        elif not is_group_consumer:
            MatchRequest.objects.create(channel_id=self.channel_id)
        self.accept()
        logger.info("New channel created")
        logger.debug("Channel id: %d", self.channel_id)
        logger.debug("Session key: %s", session.session_key)

    def disconnect(self, code):
        if self.channel_id is None:
            return  # Connection close before channel object creation
        channel_layer_info = self.channel_layer_info
        channel_layer.group_discard(
            channel_layer_info["group_prefix_channel"] + str(self.channel_id),
            self.channel_name,
        )
        if channel_layer_info["is_group_consumer"]:
            if self.profile:
                add_text_message(
                    self,
                    text=f"{self.profile['name']} left",
                    msg_type=MessageType.USER_LEFT,
                )
        if self.player_id is not None:
            handle_player_end(self)
        if self.room_id is not None:
            update_instance(
                WriteChannelSerializer,
                self.get_channel_instance(),
                {"is_active": False},
            )  # Channel will be deleted with room
            channel_layer.group_discard(
                channel_layer_info["group_prefix"] + str(self.room_id),
                self.channel_name,
            )
            if not channel_layer_info["is_group_consumer"]:
                individual_room_timeout.apply_async(
                    (self.room_id,), countdown=CHAT_SESSION_DELETION_DELAY
                )
            if self.profile:
                channel_layer.group_send(
                    channel_layer_info["group_prefix"] + str(self.room_id),
                    MessageType.USER_LEFT,
                    {"resignee": self.profile},
                )
            logger.info("Room id: %d", self.room_id)
        else:
            Channel.objects.filter(pk=self.channel_id).delete()
        logger.info("Channel disconnected id: %d", self.channel_id)

    def receive(self, text_data=None, bytes_data=None):
        payload_json = json.loads(text_data)
        message_type = payload_json["type"]
        message_data = payload_json["data"]
        if message_type == MessageType.USER_INFO:
            handle_user_info(self, message_data)
        else:
            if not (self.profile and self.room_id):
                logger.error("SuspiciousOperation : Unexpected message received")
                self.close()
                return
            if message_type == MessageType.TEXT:
                handle_text_message(self, message_data)
            elif message_type == MessageType.PLAYER_INFO:
                handle_player_info(self, message_data)
            elif message_type == MessageType.PLAYER_END:
                handle_player_end(self)

    def group_msg_receive(self, event):
        """Group message receiver"""
        payload = event["payload"]
        if "room_id" in payload["data"]:
            self.room_id = payload["data"]["room_id"]
        if payload["type"] == MessageType.CHAT_DELETE:
            self.room_id = None
        self.send(text_data=json.dumps(payload))
