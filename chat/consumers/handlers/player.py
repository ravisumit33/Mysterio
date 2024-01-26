import logging

from chat.constants import MessageType
from chat.consumers.handlers.message import add_text_message
from chat.consumers.utils import create_instance
from chat.models import Player
from chat.serializers import CreatePlayerSerializer
from chat.utils import channel_layer

logger = logging.getLogger(__name__)


def handle_player_info(consumer, message_data):
    """
    Handles player metadata for chat consumer
    """
    if consumer.channel_layer_info["is_group_consumer"]:
        room = consumer.get_room_instance()
        user = consumer.scope["user"]
        if user not in room.room_data.admins.all():
            logger.error("SuspiciousOperation : Player info received without admin access")
            consumer.close()
    name = message_data["name"]
    video_id = message_data["videoId"]

    if consumer.player_id:
        Player.objects.filter(pk=consumer.player_id).delete()
        logger.info("Old player deleted, id: %d", consumer.player_id)
        consumer.player_id = None

    player = create_instance(
        CreatePlayerSerializer,
        {
            "name": name,
            "video_id": video_id,
            "host": consumer.chat_session_id,
            "room": consumer.room_id,
        },
    )
    consumer.player_id = player.id

    channel_layer_info = consumer.channel_layer_info

    add_text_message(
        consumer,
        text=f"{consumer.profile['name']} started video player",
        msg_type=MessageType.PLAYER_INFO,
    )
    channel_layer.group_send(
        channel_layer_info["group_prefix"] + str(consumer.room_id),
        MessageType.PLAYER_INFO,
        {
            "name": message_data["name"],
            "video_id": message_data["videoId"],
            "host": consumer.profile,
            "id": consumer.player_id,
        },
    )
    logger.info("<<Player initialized>>")
    logger.debug("Player details:")
    logger.debug(message_data)


def handle_player_end(consumer):
    """
    Handles deletion of player for chat consumer
    """
    if not consumer.player_id:
        logger.error("SuspiciousOperation : Player end received without player")
        consumer.close()

    Player.objects.filter(pk=consumer.player_id).delete()
    consumer.player_id = None
    channel_layer_info = consumer.channel_layer_info
    add_text_message(
        consumer,
        text=f"{consumer.profile['name']} stopped video player",
        msg_type=MessageType.PLAYER_INFO,
    )
    channel_layer.group_send(
        channel_layer_info["group_prefix"] + str(consumer.room_id),
        MessageType.PLAYER_END,
        {
            "host": consumer.profile,
        },
    )
    logger.info("<<Player ended>>")
