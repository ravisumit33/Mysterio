import logging

from django.contrib.sessions.models import Session

import chat.models.channel as Channel
from chat.constants import MessageType
from chat.consumers.handlers.message import add_text_message
from chat.models import ChatSession
from chat.tasks import match_channels
from chat.utils import channel_layer

logger = logging.getLogger(__name__)


def handle_user_info(consumer, message_data):
    """
    Handles user metadata for chat consumer
    """
    logger.debug("User details:")
    logger.debug(message_data)
    name = message_data["name"]
    avatar_url = message_data["avatarUrl"] if "avatarUrl" in message_data else ""
    tab_session_id = message_data["sessionId"]

    session_key = consumer.scope["session"].session_key
    session = Session.objects.get(pk=session_key)
    chat_session = ChatSession.objects.create(
        name=name,
        tab_session_id=tab_session_id,
        avatar_url=avatar_url,
        session=session,
    )
    consumer.chat_session_id = chat_session.id
    consumer.profile = {
        "session_id": tab_session_id,
        "name": chat_session.name,
        "avatar_url": chat_session.avatar_url,
    }

    channel_layer_info = consumer.channel_layer_info
    channel_cls = (
        Channel.GroupChannel
        if channel_layer_info["is_group_consumer"]
        else Channel.IndividualChannel
    )
    channel_cls.objects.filter(name=consumer.channel_name).update(chat_session_id=chat_session.id)
    if not channel_layer_info["is_group_consumer"]:
        if not consumer.room_id:
            match_channels()
        else:
            channel_layer.group_send(
                channel_layer_info["group_prefix"] + str(consumer.room_id),
                MessageType.USER_JOINED,
                {},
            )

    channel_layer.group_send(
        channel_layer_info["group_prefix_channel"] + str(consumer.channel_id),
        MessageType.USER_INFO,
        {
            "sessionId": consumer.profile["session_id"],
            "roomId": consumer.room_id,
        },
    )

    if channel_layer_info["is_group_consumer"]:
        channel_layer.group_send(
            channel_layer_info["group_prefix"] + str(consumer.room_id),
            MessageType.USER_JOINED,
            {"newJoinee": consumer.profile},
        )
        add_text_message(consumer, text=f"{name} entered", msg_type=MessageType.USER_JOINED)
    logger.info("User joined.")
