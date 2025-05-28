import json
import logging

from channels.generic.websocket import JsonWebsocketConsumer

from chat.models import MatchRequest, MessageType
from chat.tasks import match_channels
from chat.utils import get_inactive_individual_room_qs

from .handlers import (
    handle_player_end,
    handle_player_info,
)

# from .mixins import ChannelLayerMixin, SecurityMixin, StorageMixin, UrlMixin

logger = logging.getLogger(__name__)


class ChatConsumer(JsonWebsocketConsumer):
    """Custom WebsocketConsumer for handling chat web socket requests"""

    def connect(self):
        super().initialize_connection()
        super().connect()
        logger.info("<<Channel connected>>")
        logger.debug("Id: %d, Session key: %s", self.channel_id, self.scope["session"].session_key)
        if self.room_id:
            logger.info("Room type: %s, id: %d", self.room_type, self.room_id)
        else:
            logger.info("New match request")
            MatchRequest.objects.create(channel_id=self.channel_id)

    def disconnect(self, code):
        logger.info("<<Channel disconnected>>")
        if self.profile:
            if self.player_id:
                player_ended_message = {"host": self.profile}
                self.add_text_message(
                    text=json.dumps(player_ended_message),
                    msg_type=MessageType.PLAYER_INFO,
                )
                self.broadcast_message(MessageType.PLAYER_END, player_ended_message)
                logger.info("<<Player ended>>")
            user_left_message = {"resignee": self.profile}
            self.add_text_message(
                text=json.dumps(user_left_message),
                msg_type=MessageType.USER_LEFT,
            )
            self.broadcast_message(MessageType.USER_LEFT, user_left_message)

    def _handle_user_joined(self):
        if self.is_group_consumer:
            self.broadcast_message(MessageType.USER_JOINED, {"newJoinee": self.profile})
            self.add_text_message(
                text=f"{self.profile.name} entered", msg_type=MessageType.USER_JOINED
            )
        elif not self.room_id:
            match_channels()
        else:
            room_inactive = get_inactive_individual_room_qs(self.room_id).exists()
            self.broadcast_message(MessageType.USER_JOINED, {"is_room_inactive": room_inactive})
        logger.info("User joined: %s", self.profile)

    def receive_json(self, content, **kwargs):
        super().receive_json(content, **kwargs)
        message_type = content["type"]
        message_data = content["data"]
        if message_type == MessageType.USER_INFO:
            self.send_message(
                MessageType.USER_INFO,
                {
                    "sessionId": message_data["session_id"],
                    "roomId": self.room_id,
                },
            )
            self._handle_user_joined()
        else:
            if not (self.profile and self.room_id):
                logger.error("SuspiciousOperation : Unexpected message received")
                self.close()
                return

            if message_type == MessageType.TEXT:
                self.add_text_message(
                    text=message_data["text"],
                    msg_type=MessageType.TEXT,
                    fail_action=lambda: self.broadcast_message(
                        MessageType.CHAT_DELETE,
                        {"text": "Room is deleted"},
                    ),
                )
                logger.info("<<Text message received>>")
                logger.debug("In room id: %s, By %s", str(self.room_id), self.profile["name"])
                logger.debug("%s", message_data["text"])
                # TODO: remove this log as messages will be encrypted
            elif message_type == MessageType.PLAYER_INFO:
                handle_player_info(self, message_data)
            elif message_type == MessageType.PLAYER_END:
                handle_player_end(self)

    def chat_message(self, event):
        """Chat message event handler"""
        payload = event["payload"]
        if payload["type"] == MessageType.CHAT_DELETE:
            self.room_id = None
        self.send_json(payload)

    def match_room(self, event):
        """Match room event handler"""
        self.room_id = event["room_id"]
        logger.info("Room type: %s, id: %d", self.room_type, self.room_id)
