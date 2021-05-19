import logging
import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.exceptions import DenyConnection
from django.db.utils import IntegrityError
from django.conf import settings
import chat.models.channel as Channel
import chat.models.message as Message
from chat.constants import MESSAGE, PREFIX

logger = logging.getLogger(__name__)


class ChatConsumer(WebsocketConsumer):
    """Custom WebsocketConsumer for handling chat web socket requests"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.channel_id = None
        self.room_id = None
        self.is_group_consumer = False
        self.session = None
        self.profile = None

    def connect(self):
        self.session = self.scope["session"]
        if self.session.session_key is None:
            if settings.DEBUG is True:  # for local development
                self.session.create()
            else:
                logger.error("SuspiciousOperation : session not created in production")
                raise DenyConnection

        # room_id in URL comes only in group chat
        if "room_id" in self.scope["url_route"]["kwargs"]:
            self.is_group_consumer = True
            try:
                self.room_id = int(self.scope["url_route"]["kwargs"]["room_id"])
            except ValueError as excp:
                logger.error("Invalid room id")
                raise DenyConnection from excp

            try:
                new_channel = Channel.GroupChannel.objects.create(
                    name=self.channel_name,
                    session_id=self.session.session_key,
                    group_room_id=self.room_id,
                )
            except IntegrityError as excp:
                logger.error("Non-existing room id %d", self.room_id)
                raise DenyConnection from excp
            async_to_sync(self.channel_layer.group_add)(
                PREFIX.GROUP_ROOM + str(self.room_id), self.channel_name
            )
            logger.info("New group channel created with room_id %d", self.room_id)
            self.channel_id = new_channel.id
            async_to_sync(self.channel_layer.group_add)(
                PREFIX.GROUP_CHANNEL + str(self.channel_id),
                self.channel_name,
            )
            logger.info("Channel id: %d", self.channel_id)
        self.accept()

    def disconnect(self, code):
        if self.channel_id is None:
            return
        if not self.is_group_consumer:
            group_prefix = PREFIX.INDIVIDUAL_ROOM
            Channel.IndividualChannel.objects.filter(pk=self.channel_id).delete()
            async_to_sync(self.channel_layer.group_discard)(
                PREFIX.INDIVIDUAL_CHANNEL + str(self.channel_id), self.channel_name
            )
            logger.info("Individual channel deleted")
        else:
            group_prefix = PREFIX.GROUP_ROOM
            try:
                Message.TextMessage.objects.create(
                    group_room_id=self.room_id,
                    sender_channel_id=self.channel_id,
                    text=f"{self.profile['name']} left",
                    message_type=MESSAGE.USER_LEFT,
                )
            except IntegrityError:
                return
            logger.info("Group channel disconnected")

        if self.room_id is not None:
            async_to_sync(self.channel_layer.group_discard)(
                group_prefix + str(self.room_id), self.channel_name
            )
            async_to_sync(self.channel_layer.group_send)(
                group_prefix + str(self.room_id),
                {
                    "type": "group_msg_receive",
                    "payload": {
                        "type": MESSAGE.USER_LEFT,
                        "data": {"resignee": self.profile},
                    },
                },
            )
            logger.info("Room id: %d, Channel id: %d", self.room_id, self.channel_id)

    def receive(self, text_data=None, bytes_data=None):
        payload_json = json.loads(text_data)
        message_type = payload_json["type"]
        message_data = payload_json["data"]
        if message_type == MESSAGE.TEXT:
            if self.room_id is None:
                logger.error(
                    "SuspiciousOperation : Text message received outside of room"
                )
                self.close()
                return
            if "name" not in self.session:
                logger.error("SuspiciousOperation : Text message received with no name")
                self.close()
                return
            group_prefix = PREFIX.INDIVIDUAL_ROOM
            if self.is_group_consumer:
                group_prefix = PREFIX.GROUP_ROOM
                try:
                    Message.TextMessage.objects.create(
                        group_room_id=self.room_id,
                        sender_channel_id=self.channel_id,
                        text=message_data["text"],
                        message_type=MESSAGE.TEXT,
                    )
                except IntegrityError:
                    async_to_sync(self.channel_layer.group_send)(
                        group_prefix + str(self.room_id),
                        {
                            "type": "group_msg_receive",
                            "payload": {
                                "type": MESSAGE.CHAT_DELETE,
                                "data": {
                                    "text": "Group is deleted as it is more than one month older",
                                },
                            },
                        },
                    )
                    return
            async_to_sync(self.channel_layer.group_send)(
                group_prefix + str(self.room_id),
                {
                    "type": "group_msg_receive",
                    "payload": {
                        "type": MESSAGE.TEXT,
                        "data": {
                            "text": message_data["text"],
                            "sender": self.profile,
                        },
                    },
                },
            )
            logger.info(
                "Text message received in room id %d by %s",
                self.room_id,
                self.session["name"],
            )
            logger.info("%s", message_data["text"])
            # TODO: remove this log as messages will be encrypted
        elif message_type == MESSAGE.USER_INFO:
            logger.info("User details: %s", message_data["name"])
            name = message_data["name"]
            avatar_url = (
                message_data["avatarUrl"] if "avatarUrl" in message_data else ""
            )
            self.session["id"] = self.channel_name
            self.session["name"] = name
            self.session["avatarUrl"] = avatar_url
            self.session.save()
            self.profile = {
                "id": self.channel_name,
                "name": self.session["name"],
                "avatarUrl": self.session["avatarUrl"],
            }
            if not self.is_group_consumer:
                group_prefix_channel = PREFIX.INDIVIDUAL_CHANNEL
                new_channel = Channel.IndividualChannel.objects.create(
                    name=self.channel_name,
                    session_id=self.session.session_key,
                )
                self.channel_id = new_channel.id
                async_to_sync(self.channel_layer.group_add)(
                    group_prefix_channel + str(self.channel_id),
                    self.channel_name,
                )
                logger.info("New individual channel created")
                logger.info("Channel id: %d", self.channel_id)
            else:
                group_prefix_channel = PREFIX.GROUP_CHANNEL
            async_to_sync(self.channel_layer.group_send)(
                group_prefix_channel + str(self.channel_id),
                {
                    "type": "group_msg_receive",
                    "payload": {
                        "type": MESSAGE.USER_INFO,
                        "data": {
                            "id": self.session["id"],
                        },
                    },
                },
            )

            if self.is_group_consumer:
                try:
                    Message.TextMessage.objects.create(
                        group_room_id=self.room_id,
                        sender_channel_id=self.channel_id,
                        text=f"{name} entered",
                        message_type=MESSAGE.USER_JOINED,
                    )
                except IntegrityError:
                    return
                async_to_sync(self.channel_layer.group_send)(
                    PREFIX.GROUP_ROOM + str(self.room_id),
                    {
                        "type": "group_msg_receive",
                        "payload": {
                            "type": MESSAGE.USER_JOINED,
                            "data": {"newJoinee": self.profile},
                        },
                    },
                )

    def group_msg_receive(self, event):
        """Group message receiver"""
        payload = event["payload"]
        if "room_id" in payload["data"]:
            self.room_id = payload["data"]["room_id"]
        self.send(text_data=json.dumps(payload))
