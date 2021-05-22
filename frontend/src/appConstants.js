const MessageType = {
  USER_JOINED: 1,
  USER_LEFT: 2,
  USER_INFO: 3,
  TEXT: 4,
  CHAT_DELETE: 5,
};

const ChatStatus = {
  NOT_STARTED: 0,
  ONGOING: 1,
  ENDED: 2,
  NO_MATCH_FOUND: 3,
  RECONNECT_REQUESTED: 4,
};

const MysterioOrigin = 'https://mysterio-chat.herokuapp.com';
const MysterioHost = 'mysterio-chat.herokuapp.com';

const MatchTimeout = 60 * 1000; // 1 minute

export { MessageType, ChatStatus, MysterioOrigin, MysterioHost, MatchTimeout };
