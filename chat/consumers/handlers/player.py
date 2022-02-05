import logging
from chat.consumers.handlers.message import add_text_message
import chat.models.room as Room
from chat.models import Player
from chat.constants import MessageType
from chat.utils import channel_layer

logger = logging.getLogger(__name__)


def handle_player_info(consumer, message_data):
    """
    Handles player metadata for chat consumer
    """
    logger.debug("Player details:")
    logger.debug(message_data)
    name = message_data["name"]
    video_id = message_data["videoId"]

    player = Player(name=name, video_id=video_id, host_id=consumer.chat_session_id)
    player.save()
    consumer.player_id = player.id

    channel_layer_info = consumer.channel_layer_info

    room_cls = (
        Room.GroupRoom
        if channel_layer_info["is_group_consumer"]
        else Room.IndividualRoom
    )
    room_cls.objects.filter(id=consumer.room_id).update(player=player)

    if channel_layer_info["is_group_consumer"]:
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
        },
    )
    logger.info("Player initialized")


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
    if channel_layer_info["is_group_consumer"]:
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
    logger.info("Player ended.")
