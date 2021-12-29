import logging
import json
from channels.generic.websocket import WebsocketConsumer
from channels.exceptions import DenyConnection
from django.db.utils import IntegrityError
from chat.models import ChatSession
import chat.models.channel as Channel
import chat.models.message as Message
from chat.constants import MessageType, GroupPrefix
from chat.utils import channel_layer

logger = logging.getLogger(__name__)


class ChatConsumer(WebsocketConsumer):
    """Custom WebsocketConsumer for handling chat web socket requests"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Id of channel model
        self.channel_id = None

        # Id(int) of GroupRoom model for group consumer, uuid(str) for individual consumer
        self.room_id = None

        self.is_group_consumer = False

        self.profile = None

    def connect(self):
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
            logger.info("New group channel created with room_id %s", str(self.room_id))
            self.channel_id = new_channel.id
            channel_layer.group_add(
                GroupPrefix.GROUP_CHANNEL + str(self.channel_id), self.channel_name
            )
            logger.info("Channel id: %d", self.channel_id)
        self.accept()

    def disconnect(self, code):
        if self.channel_id is None:
            # Connection close before channel object creation
            return

        if not self.is_group_consumer:
            group_prefix = GroupPrefix.INDIVIDUAL_ROOM
            Channel.IndividualChannel.objects.filter(pk=self.channel_id).delete()
            channel_layer.group_discard(
                GroupPrefix.INDIVIDUAL_CHANNEL + str(self.channel_id), self.channel_name
            )
            logger.info("Individual channel deleted")
        else:
            group_prefix = GroupPrefix.GROUP_ROOM
            try:
                Message.TextMessage.objects.create(
                    group_room_id=self.room_id,
                    sender_channel_id=self.channel_id,
                    text=f"{self.profile['name']} left",
                    message_type=MessageType.USER_LEFT,
                )
            except IntegrityError:
                # Group room deleted
                return
            logger.info("Group channel disconnected")

        if self.room_id is not None:
            channel_layer.group_discard(
                group_prefix + str(self.room_id), self.channel_name
            )
            channel_layer.group_send(
                group_prefix + str(self.room_id),
                MessageType.USER_LEFT,
                {"resignee": self.profile},
            )
            logger.info(
                "Room id: %s, Channel id: %d", str(self.room_id), self.channel_id
            )

    def receive(self, text_data=None, bytes_data=None):
        payload_json = json.loads(text_data)
        message_type = payload_json["type"]
        message_data = payload_json["data"]
        if message_type == MessageType.TEXT:
            if self.room_id is None:
                logger.error(
                    "SuspiciousOperation : Text message received outside of room"
                )
                self.close()
                return
            group_prefix = GroupPrefix.INDIVIDUAL_ROOM
            if self.is_group_consumer:
                group_prefix = GroupPrefix.GROUP_ROOM
                try:
                    Message.TextMessage.objects.create(
                        group_room_id=self.room_id,
                        sender_channel_id=self.channel_id,
                        text=message_data["text"],
                        message_type=MessageType.TEXT,
                    )
                except IntegrityError:
                    channel_layer.group_send(
                        group_prefix + str(self.room_id),
                        MessageType.CHAT_DELETE,
                        {"text": "Group is deleted"},
                    )
                    return
            channel_layer.group_send(
                group_prefix + str(self.room_id),
                MessageType.TEXT,
                {
                    "text": message_data["text"],
                    "sender": self.profile,
                },
            )
            logger.info(
                "Text message received in room id %s by %s",
                str(self.room_id),
                self.profile["name"],
            )
            logger.info("%s", message_data["text"])
            # TODO: remove this log as messages will be encrypted
        elif message_type == MessageType.USER_INFO:
            logger.info("User details:")
            logger.info(message_data)
            name = message_data["name"]
            avatar_url = (
                message_data["avatarUrl"] if "avatarUrl" in message_data else ""
            )
            session_id = message_data["sessionId"]
            session_id = session_id if session_id else self.channel_name
            chat_session = ChatSession(
                session_id=session_id, name=name, avatar_url=avatar_url
            )
            chat_session.save()
            self.profile = {
                "session_id": chat_session.session_id,
                "name": chat_session.name,
                "avatarUrl": chat_session.avatar_url,
            }

            if not self.is_group_consumer:
                group_prefix_channel = GroupPrefix.INDIVIDUAL_CHANNEL
                new_channel = Channel.IndividualChannel.objects.create(
                    name=self.channel_name,
                    session_id=chat_session.id,
                )
                self.channel_id = new_channel.id
                channel_layer.group_add(
                    group_prefix_channel + str(self.channel_id), self.channel_name
                )
                logger.info("New individual channel created")
                logger.info("Channel id: %d", self.channel_id)
            else:
                group_prefix_channel = GroupPrefix.GROUP_CHANNEL
                Channel.GroupChannel.objects.filter(name=self.channel_name).update(
                    session_id=chat_session.id
                )

            channel_layer.group_send(
                group_prefix_channel + str(self.channel_id),
                MessageType.USER_INFO,
                {
                    "session_id": self.profile["session_id"],
                },
            )

            if self.is_group_consumer:
                try:
                    Message.TextMessage.objects.create(
                        group_room_id=self.room_id,
                        sender_channel_id=self.channel_id,
                        text=f"{name} entered",
                        message_type=MessageType.USER_JOINED,
                    )
                except IntegrityError:
                    return
                channel_layer.group_send(
                    GroupPrefix.GROUP_ROOM + str(self.room_id),
                    MessageType.USER_JOINED,
                    {"newJoinee": self.profile},
                )

    def group_msg_receive(self, event):
        """Group message receiver"""
        payload = event["payload"]
        if "room_id" in payload["data"]:
            self.room_id = payload["data"]["room_id"]
        self.send(text_data=json.dumps(payload))
