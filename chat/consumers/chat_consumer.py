import json
import logging

from channels.exceptions import DenyConnection
from channels.generic.websocket import WebsocketConsumer
from django.db.utils import IntegrityError

import chat.models.channel as Channel
from chat.constants import CHAT_SESSION_DELETION_DELAY, GroupPrefix, MessageType
from chat.consumers.handlers.message import add_text_message
from chat.tasks import individual_room_timeout
from chat.utils import channel_layer

from .handlers import (
    handle_player_end,
    handle_player_info,
    handle_text_message,
    handle_user_info,
)

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

    def connect(self):
        session = self.scope["session"]
        if session.session_key is None:
            logger.error("SuspiciousOperation: WebSocket connection without session")
            raise DenyConnection
        if "room_id" in (url_kwargs := self.scope["url_route"]["kwargs"]):
            try:
                self.room_id = int(url_kwargs["room_id"])
            except ValueError as excp:
                logger.error("Invalid room id")
                raise DenyConnection from excp

            if "room_type" not in url_kwargs:
                logger.error("Room id given without room type")
                raise DenyConnection
            if url_kwargs["room_type"] not in ["individual", "group"]:
                logger.error("Invalid room type")
                raise DenyConnection

            is_group_consumer = True if url_kwargs["room_type"] == "group" else False
            self.channel_layer_info = {
                "is_group_consumer": is_group_consumer,
                "group_prefix": (
                    GroupPrefix.GROUP_ROOM if is_group_consumer else GroupPrefix.INDIVIDUAL_ROOM
                ),
                "group_prefix_channel": (
                    GroupPrefix.GROUP_CHANNEL
                    if is_group_consumer
                    else GroupPrefix.INDIVIDUAL_CHANNEL
                ),
            }
            channel_cls = Channel.GroupChannel if is_group_consumer else Channel.IndividualChannel
            try:
                new_channel = channel_cls.objects.create(
                    name=self.channel_name,
                    room_id=self.room_id,
                )
            except IntegrityError as excp:
                logger.error("Unable to create channel. Room probably doesn't exist.")
                logger.error("Room type: %s, id: %d", url_kwargs["room_type"], self.room_id)
                raise DenyConnection from excp
            self.channel_id = new_channel.id
            logger.info("New channel created")
            logger.info("Room type: %s, id: %d", url_kwargs["room_type"], self.room_id)
            channel_layer.group_add(
                self.channel_layer_info["group_prefix"] + str(self.room_id), self.channel_name
            )
        else:
            self.channel_layer_info = {
                "is_group_consumer": False,
                "group_prefix": GroupPrefix.INDIVIDUAL_ROOM,
                "group_prefix_channel": GroupPrefix.INDIVIDUAL_CHANNEL,
            }
            new_channel = Channel.IndividualChannel.objects.create(name=self.channel_name)
            self.channel_id = new_channel.id
            logger.info("New individual channel created for match")

        channel_layer.group_add(
            self.channel_layer_info["group_prefix_channel"] + str(self.channel_id),
            self.channel_name,
        )
        self.accept()
        logger.debug("Channel id: %d", self.channel_id)
        logger.debug("Session key: %s", session.session_key)

    def disconnect(self, code):
        if self.channel_id is None:
            # Connection close before channel object creation
            return

        channel_layer_info = self.channel_layer_info
        channel_layer.group_discard(
            channel_layer_info["group_prefix_channel"] + str(self.channel_id),
            self.channel_name,
        )
        channel_cls = (
            Channel.GroupChannel
            if channel_layer_info["is_group_consumer"]
            else Channel.IndividualChannel
        )
        if channel_layer_info["is_group_consumer"]:
            if self.profile:
                add_text_message(
                    self,
                    text=f"{self.profile['name']} left",
                    msg_type=MessageType.USER_LEFT,
                )
        logger.info("Channel disconnected id: %d", self.channel_id)

        if self.player_id is not None:
            handle_player_end(self)
        if self.room_id is not None:
            channel_cls.objects.filter(pk=self.channel_id).update(
                is_active=False
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
            channel_cls.objects.filter(pk=self.channel_id).delete()

    def receive(self, text_data=None, bytes_data=None):
        payload_json = json.loads(text_data)
        message_type = payload_json["type"]
        message_data = payload_json["data"]
        if message_type == MessageType.USER_INFO:
            handle_user_info(self, message_data)
        else:
            if not self.profile:
                logger.error("SuspiciousOperation : Socket message received without user info")
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
        self.send(text_data=json.dumps(payload))
