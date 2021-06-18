# pylint: disable=invalid-name
from enum import IntEnum
from dataclasses import dataclass


class MessageType(IntEnum):
    """Message enum to be sent on client"""

    USER_JOINED = 1
    USER_LEFT = 2
    USER_INFO = 3
    TEXT = 4
    CHAT_DELETE = 5


@dataclass
class GroupPrefix:
    """Prefix used in making group names"""

    INDIVIDUAL_CHANNEL = "grp_IndividualChannel_"
    GROUP_CHANNEL = "grp_GroupChannel_"
    GROUP_ROOM = "grp_GroupRoom_"
    INDIVIDUAL_ROOM = "grp_IndividualRoom_"
