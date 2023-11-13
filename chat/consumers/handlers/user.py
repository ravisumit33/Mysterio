import logging

from chat.constants import MessageType
from chat.consumers.handlers.message import add_text_message
from chat.consumers.utils import create_instance, update_instance
from chat.serializers import ChatSessionSerializer, WriteChannelSerializer
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
    chat_session = create_instance(
        ChatSessionSerializer,
        {
            "name": name,
            "tab_session_id": tab_session_id,
            "avatar_url": avatar_url,
            "session": session_key,
        },
    )
    consumer.chat_session_id = chat_session.id
    consumer.profile = {
        "session_id": tab_session_id,
        "name": chat_session.name,
        "avatar_url": chat_session.avatar_url,
    }

    channel_layer_info = consumer.channel_layer_info
    update_instance(
        WriteChannelSerializer,
        consumer.get_channel_instance(),
        {"chat_session": chat_session.id},
    )
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
