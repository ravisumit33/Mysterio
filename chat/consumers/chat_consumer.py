import logging
import json
from channels.generic.websocket import WebsocketConsumer
from channels.exceptions import DenyConnection
from django.db.utils import IntegrityError
from chat.consumers.handlers.message import add_text_message
import chat.models.channel as Channel
from chat.models import Player
from chat.constants import MessageType, GroupPrefix
from chat.utils import channel_layer
from .handlers import (
    handle_text_message,
    handle_user_info,
    handle_player_info,
    handle_player_end,
)

logger = logging.getLogger(__name__)


class ChatConsumer(WebsocketConsumer):
    """Custom WebsocketConsumer for handling chat web socket requests"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.channel_id = None  # Id of channel model
        self.room_id = None  # int for group consumer, str for individual consumer
        self.player_id = None  # Id of player model if this channel is host
        self.chat_session_id = None  # Id of ChatSession model related to this channel
        self.profile = {}
        self.channel_layer_info = {}

    def connect(self):
        session = self.scope["session"]
        if session.session_key is None:
            logger.error("SuspiciousOperation: WebSocket connection without session")
            raise DenyConnection
        # room_id in URL comes only in group chat
        if "room_id" in self.scope["url_route"]["kwargs"]:
            self.channel_layer_info = {
                "is_group_consumer": True,
                "group_prefix": GroupPrefix.GROUP_ROOM,
                "group_prefix_channel": GroupPrefix.GROUP_CHANNEL,
            }
            try:
                self.room_id = int(self.scope["url_route"]["kwargs"]["room_id"])
            except ValueError as excp:
                logger.error("Invalid room id")
                raise DenyConnection from excp

            try:
                new_channel = Channel.GroupChannel.objects.create(
                    name=self.channel_name,
                    group_room_id=self.room_id,
                )
            except IntegrityError as excp:
                logger.error("Cannot create group channel")
                logger.error("Channel name: %s", self.channel_name)
                logger.error("Room id: %s", str(self.room_id))
                raise DenyConnection from excp
            channel_layer.group_add(
                GroupPrefix.GROUP_ROOM + str(self.room_id), self.channel_name
            )
            logger.info("New group channel created")
            self.channel_id = new_channel.id
            channel_layer.group_add(
                GroupPrefix.GROUP_CHANNEL + str(self.channel_id), self.channel_name
            )
            logger.debug("Room id: %d", self.room_id)
            logger.debug("Channel id: %d", self.channel_id)
            logger.debug("Session key: %s", session.session_key)
        else:
            self.channel_layer_info = {
                "is_group_consumer": False,
                "group_prefix": GroupPrefix.INDIVIDUAL_ROOM,
                "group_prefix_channel": GroupPrefix.INDIVIDUAL_CHANNEL,
            }

        self.accept()

    def disconnect(self, code):
        if self.channel_id is None:
            # Connection close before channel object creation
            return

        channel_layer_info = self.channel_layer_info
        if not channel_layer_info["is_group_consumer"]:
            Channel.IndividualChannel.objects.filter(pk=self.channel_id).delete()
            channel_layer.group_discard(
                channel_layer_info["group_prefix_channel"] + str(self.channel_id),
                self.channel_name,
            )
            logger.info("Individual channel deleted")
        else:
            add_text_message(
                self,
                text=f"{self.profile['name']} left",
                msg_type=MessageType.USER_LEFT,
            )
            if "id" in self.profile:
                Player.objects.filter(host_id=self.profile["id"]).delete()
            logger.info("Group channel disconnected")

        if self.room_id is not None:
            channel_layer.group_discard(
                channel_layer_info["group_prefix"] + str(self.room_id),
                self.channel_name,
            )
            channel_layer.group_send(
                channel_layer_info["group_prefix"] + str(self.room_id),
                MessageType.USER_LEFT,
                {"resignee": self.profile},
            )
            logger.info(
                "Room id: %s, Channel id: %d", str(self.room_id), self.channel_id
            )

        if self.player_id is not None:
            handle_player_end(self)

    def receive(self, text_data=None, bytes_data=None):
        payload_json = json.loads(text_data)
        message_type = payload_json["type"]
        message_data = payload_json["data"]
        if message_type == MessageType.TEXT:
            handle_text_message(self, message_data)
        elif message_type == MessageType.USER_INFO:
            handle_user_info(self, message_data)
        elif message_type == MessageType.PLAYER_INFO:
            handle_player_info(self, message_data)
        elif message_type == MessageType.PLAYER_END:
            handle_player_end(self)

    def group_msg_receive(self, event):
        """Group message receiver"""
        payload = event["payload"]
        if "room_id" in payload["data"]:
            self.room_id = payload["data"]["room_id"]
        self.send(text_data=json.dumps(payload))
