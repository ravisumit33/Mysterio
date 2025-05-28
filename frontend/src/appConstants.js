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
  NOT_STARTED: 'NOT_STARTED',
  ONGOING: 'ONGOING',
  ENDED: 'ENDED',
  NO_MATCH_FOUND: 'NO_MATCH_FOUND',
  RECONNECTING: 'RECONNECTING',
});

const MessageSenderType = Object.freeze({
  SELF: 'SELF',
  OTHER: 'OTHER',
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
  PROFILE_DATA: 'profile-data',
  CHAT_WINDOW_DATA: 'chat-window-data',
});

const BrowserStorageKeysPrefix = 'mysterio-anon-chat-';

const HydrationKeys = Object.freeze({
  USER: 'user',
  PROFILE: 'profile',
});

const GlobalDialogTypes = Object.freeze({
  USER_INFO: 'userInfo',
  ROOM_PASSWORD: 'roomPwd',
});

const ChatHydrationStatus = Object.freeze({
  LOADING: 'LOADING',
  READY: 'READY',
  FAILED: 'FAILED',
});

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
  HydrationKeys,
  GlobalDialogTypes,
  ChatHydrationStatus,
};
