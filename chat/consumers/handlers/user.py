import logging
from django.contrib.sessions.models import Session
from chat.constants import MessageType
from chat.consumers.handlers.message import add_text_message
import chat.models.channel as Channel
from chat.models import ChatSession
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
    pub_key = message_data["pubKey"]
    tab_session_id = message_data["sessionId"]
    tab_session_id = tab_session_id if tab_session_id else consumer.channel_name

    session_key = consumer.scope["session"].session_key
    session = Session.objects.get(pk=session_key)
    chat_session = ChatSession.objects.create(
        name=name,
        tab_session_id=tab_session_id,
        avatar_url=avatar_url,
        session=session,
        pub_key=pub_key,
    )
    consumer.chat_session_id = chat_session.id
    consumer.profile = {
        "id": consumer.chat_session_id,
        "session_id": tab_session_id,
        "name": chat_session.name,
        "avatarUrl": chat_session.avatar_url,
        "pubKey": chat_session.pub_key,
    }

    channel_layer_info = consumer.channel_layer_info
    if not channel_layer_info["is_group_consumer"]:
        new_channel = Channel.IndividualChannel.objects.create(
            name=consumer.channel_name,
            chat_session_id=chat_session.id,
        )
        consumer.channel_id = new_channel.id
        channel_layer.group_add(
            channel_layer_info["group_prefix_channel"] + str(consumer.channel_id),
            consumer.channel_name,
        )
        logger.info("New individual channel created")
        logger.info("Channel id: %d", consumer.channel_id)
    else:
        Channel.GroupChannel.objects.filter(name=consumer.channel_name).update(
            chat_session_id=chat_session.id
        )

    channel_layer.group_send(
        channel_layer_info["group_prefix_channel"] + str(consumer.channel_id),
        MessageType.USER_INFO,
        {
            "profile": consumer.profile,
        },
    )

    if channel_layer_info["is_group_consumer"]:
        channel_layer.group_send(
            channel_layer_info["group_prefix_room"] + str(consumer.room_id),
            MessageType.USER_JOINED,
            {"newJoinee": consumer.profile},
        )
        add_text_message(
            consumer, text=f"{name} entered", msg_type=MessageType.USER_JOINED
        )
    logger.info("User joined.")
