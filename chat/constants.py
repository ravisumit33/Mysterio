from dataclasses import dataclass
from enum import IntEnum


class MessageType(IntEnum):
    """Message enum to be sent on client"""

    USER_JOINED = 1
    USER_LEFT = 2
    USER_INFO = 3
    TEXT = 4
    CHAT_DELETE = 5
    PLAYER_INFO = 6
    PLAYER_SYNC = 7
    PLAYER_END = 8


@dataclass
class GroupPrefix:
    """Prefix used in making group names"""

    INDIVIDUAL_CHANNEL = "grp_IndividualChannel_"
    GROUP_CHANNEL = "grp_GroupChannel_"
    GROUP_ROOM = "grp_GroupRoom_"
    INDIVIDUAL_ROOM = "grp_IndividualRoom_"


@dataclass
class CacheKey:
    """Keys used to store data in cache"""

    LAST_MATCH_SCHEDULED_TIME = "last_match_scheduled_time"


MATCH_DELAY = 5  # Seconds to wait before scheduling match task

MESSAGE_PAGE_SIZE = 250
