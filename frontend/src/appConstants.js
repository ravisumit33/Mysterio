const MessageType = Object.freeze({
  USER_JOINED: 1,
  USER_LEFT: 2,
  USER_INFO: 3,
  TEXT: 4,
  CHAT_DELETE: 5,
  PLAYER_INFO: 6,
  PLAYER_SYNC: 7,
  PLAYER_END: 8,
  RECONNECTING: 9,
  DISCONNECTED: 10,
});

const RoomType = Object.freeze({
  INDIVIDUAL: 'in',
  GROUP: 'gr',
});

const ChatStatus = Object.freeze({
  NOT_STARTED: 0,
  ONGOING: 1,
  ENDED: 2,
  NO_MATCH_FOUND: 3,
  RECONNECTING: 4,
});

const MessageSenderType = Object.freeze({
  SELF: 0,
  OTHER: 1,
});

const PlayerName = Object.freeze({
  YOUTUBE: 'YT',
});

const PlayerStatus = Object.freeze({
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
});

const renderPlayerName = (playerName) => {
  switch (playerName) {
    case PlayerName.YOUTUBE:
      return 'YouTube';
    default:
      return '';
  }
};

const MysterioOrigin = 'https://mysterio-chat.com';
const MysterioHost = 'mysterio-chat.com';

const MatchTimeout = 60 * 1000; // 1 minute

const ReconnectTimeout = 60 * 1000; // 1 minute

const BrowserStorageKeys = Object.freeze({
  profileName: 'profile-name',
  profileAvatarUrl: 'profile-avatar-url',
  profileSessionId: 'profile-session-id',
  chatWindowData: 'chat-window-data',
});

const BrowserStorageKeysPrefix = 'mysterio-anon-chat-';

const OngoingChatRegex = /^\/chat\/(?<roomType>\w+)\/(?<roomId>[0-9]+)(\/.*)?$/;

export {
  MessageType,
  RoomType,
  MessageSenderType,
  ChatStatus,
  MysterioOrigin,
  MysterioHost,
  MatchTimeout,
  ReconnectTimeout,
  PlayerName,
  PlayerStatus,
  renderPlayerName,
  BrowserStorageKeys,
  BrowserStorageKeysPrefix,
  OngoingChatRegex,
};
