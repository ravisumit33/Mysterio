from enum import Enum


class ChannelLayerPrefix(str, Enum):
    """Prefix used in making channel layer group names"""

    GROUP_ROOM = "grp_GroupRoom_"
    INDIVIDUAL_ROOM = "grp_IndividualRoom_"


class CacheKey(str, Enum):
    """Keys used to store data in cache"""

    LAST_MATCH_SCHEDULED_TIME = "last_match_scheduled_time"


MATCH_DELAY = 5  # Seconds to wait before scheduling match task
CHAT_SESSION_DELETION_DELAY = (
    40  # Seconds to wait after channel disconnection before individual room deletion
)

MESSAGE_PAGE_SIZE = 250
