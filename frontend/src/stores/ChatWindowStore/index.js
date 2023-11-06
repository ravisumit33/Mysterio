import { makeAutoObservable } from 'mobx';
import { ChatStatus, MatchTimeout, MessageType } from 'appConstants';
import log from 'loglevel';
import { fetchUrl, isEmptyObj } from 'utils';
import profileStore from '../ProfileStore';
import Socket from './socket';

class ChatWindowStore {
  avatarUrl = '';

  name = '';

  messageList = [];

  chatStatus = ChatStatus.NOT_STARTED;

  initDone = false; // Chat started and initialization(if required) is done

  roomInfo = {};

  previousMessagesInfo = { fetchingPreviousMessages: false };

  shouldOpenPlayer = false;

  playerExists = false; // player exists on server

  syncedPlayerData = null; // synced player information if player is opened

  constructor({ appStore, data }) {
    makeAutoObservable(this);
    this.appStore = appStore;
    const initPromise = this.initState(data || {});
    initPromise.then(() => {
      this.socket = new Socket(this);
    });
  }

  initState = ({ roomId = '', password = '', isGroupRoom = false }) => {
    this.setRoomInfo({
      ...this.roomInfo,
      roomId,
      isGroupRoom,
      password,
    });
    this.setPreviousMessagesInfo({ ...this.previousMessagesInfo, fetchingPreviousMessages: false });
    const initPromise = isGroupRoom ? this.initializeForGroup() : this.initializeForIndividual();
    return initPromise;
  };

  syncRoomData = (requestData = {}) =>
    fetchUrl(`/api/chat/${this.roomType}_rooms/${this.roomInfo.roomId}/`, { ...requestData })
      .catch((err) => {
        log.error(err);
        this.setInitDone(true);
        this.appStore.removeChatWindow();
        this.appStore.showAlert({
          text: 'Error occured while connecting to server.',
          severity: 'error',
        });
        throw err;
      })
      .then(async (response) => {
        const { data } = response;
        // @ts-ignore
        const { player, name } = data;
        this.setName(name);
        if (player) {
          this.setPlayerData(player);
          this.setPlayerExists(true);
        }
        // @ts-ignore
        const avatarUrl = data.avatar_url;
        this.setAvatarUrl(avatarUrl);
        // @ts-ignore
        this.setPreviousMessagesInfo({ ...this.previousMessagesInfo, next: data.messages });
        await this.loadPreviousMessages(requestData);
        return data;
      });

  initializeForIndividual = () => {
    this.setRoomInfo({ ...this.roomInfo, adminAccess: true });
    let initPromise = Promise.resolve();
    if (this.roomInfo.roomId) {
      // @ts-ignore
      initPromise = this.syncRoomData();
    }
    return initPromise;
  };

  initializeForGroup = async () => {
    await fetchUrl('/api/account/token/refresh/', { method: 'post' }).catch((err) => {});
    return this.syncRoomData({
      headers: { 'X-Group-Password': this.roomInfo.password },
    }).then(async (data) => {
      // @ts-ignore
      const adminAccess = data.admin_access;
      // @ts-ignore
      const isFavorite = data.is_favorite;
      // @ts-ignore
      const isCreator = data.is_creator;
      this.setRoomInfo({
        ...this.roomInfo,
        adminAccess,
        isFavorite,
        isCreator,
      });
    });
  };

  setName = (newName) => {
    this.name = newName;
  };

  setAvatarUrl = (url) => {
    this.avatarUrl = url;
  };

  setInitDone = (initDone) => {
    this.initDone = initDone;
  };

  setShouldOpenPlayer = (shouldOpenPlayer) => {
    this.shouldOpenPlayer = shouldOpenPlayer;
  };

  setRoomInfo = (newRoomInfo) => {
    this.roomInfo = newRoomInfo;
  };

  setPreviousMessagesInfo = (newPreviousMessagesInfo) => {
    this.previousMessagesInfo = newPreviousMessagesInfo;
  };

  setPlayerData = (newPlayerData) => {
    this.syncedPlayerData = newPlayerData;
  };

  setPlayerExists = (newPlayerExists) => {
    this.playerExists = newPlayerExists;
  };

  get isGroupChat() {
    return this.roomInfo.isGroupRoom;
  }

  get roomType() {
    return this.roomInfo.isGroupRoom ? 'group' : 'individual';
  }

  get isHost() {
    if (this.syncedPlayerData) {
      const { host } = this.syncedPlayerData;
      return profileStore.sessionId === host.session_id;
    }
    return false;
  }

  loadPreviousMessages = (requestData) => {
    const { next } = this.previousMessagesInfo;
    if (!next) return Promise.resolve(0);
    this.setPreviousMessagesInfo({ ...this.previousMessagesInfo, fetchingPreviousMessages: true });
    return fetchUrl(`${next}`, { ...requestData })
      .catch((err) => {
        log.error(err);
        this.appStore.showAlert({
          text: 'Error occured while fetching previous messages.',
          severity: 'error',
        });
        throw err;
      })
      .then((response) => {
        const responseData = response.data;
        // @ts-ignore
        const { results: messages } = responseData;
        let detailMessages;
        if (!messages) {
          detailMessages = [
            {
              type: MessageType.CHAT_DELETE,
              data: {
                text: 'Room is deleted',
              },
            },
          ];
          this.addInitMessageList(detailMessages);
          this.closeChatSession();
        } else {
          // @ts-ignore
          detailMessages = messages.map((msg) => {
            const message = {
              data: {},
            };
            message.data.content = msg.content;
            message.type = msg.message_type;
            const chatSessionData = (msg.sender_channel && msg.sender_channel.chat_session) || {};
            switch (message.type) {
              case MessageType.TEXT:
                message.data.sender = chatSessionData;
                break;
              case MessageType.USER_JOINED:
                message.data.newJoinee = chatSessionData;
                break;
              case MessageType.USER_LEFT:
                message.data.resignee = chatSessionData;
                break;
              case MessageType.PLAYER_INFO:
              case MessageType.PLAYER_END:
                message.data.host = chatSessionData;
                break;
              default:
                log.error('Unknown message type');
                break;
            }
            return message;
          });
        }
        const prevMessageList = [];
        detailMessages.forEach((msg) => {
          const processedMessage = this.processMessage(msg, true);
          if (!isEmptyObj(processedMessage)) {
            prevMessageList.push(processedMessage);
          }
        });
        prevMessageList.reverse();
        this.addInitMessageList(prevMessageList);
        this.setPreviousMessagesInfo({
          ...this.previousMessagesInfo,
          // @ts-ignore
          next: responseData.next,
          previousMessagesCount:
            // @ts-ignore
            this.previousMessagesInfo.previousMessagesCount || responseData.count,
        });
        return prevMessageList.length;
      })
      .finally(() => {
        this.setPreviousMessagesInfo({
          ...this.previousMessagesInfo,
          fetchingPreviousMessages: false,
        });
      });
  };

  processMessage = (payload, isInitMsg) => {
    const messageType = payload.type;
    const messageData = payload.data;
    switch (messageType) {
      case MessageType.USER_INFO:
        if (!this.isGroupChat) {
          const { roomId } = messageData;
          if (!roomId) {
            clearTimeout(this.matchTimeout);
            this.matchTimeout = setTimeout(
              (chatWindowStore) => {
                if (chatWindowStore.chatStatus === ChatStatus.NOT_STARTED) {
                  chatWindowStore.socket.close();
                  chatWindowStore.setChatStatus(ChatStatus.NO_MATCH_FOUND);
                }
              },
              MatchTimeout,
              this
            );
            this.setChatStatus(ChatStatus.NOT_STARTED);
          }
        }
        return {};
      case MessageType.USER_JOINED: {
        if (this.chatStatus === ChatStatus.NOT_STARTED) {
          if (this.isGroupChat) {
            messageData.content = `${messageData.newJoinee.name} entered`;
          } else if ('match' in messageData) {
            clearTimeout(this.matchTimeout);
            this.setName(messageData.match.name);
            this.setAvatarUrl(messageData.match.avatarUrl);
            this.setRoomInfo({ ...this.roomInfo, roomId: messageData.room_id });
            messageData.content = `You are connected to ${messageData.match.name}`;
          } else {
            // Direct entry into individual room using link
          }
        } else if (this.chatStatus === ChatStatus.RECONNECTING) {
          messageData.content = 'Connection restored';
        }
        if (!isInitMsg) {
          this.setChatStatus(ChatStatus.ONGOING);
          this.setInitDone(true);
        }
        break;
      }
      case MessageType.USER_LEFT:
        if (this.isGroupChat) {
          messageData.content = `${messageData.resignee.name} left`;
        } else {
          this.setChatStatus(ChatStatus.RECONNECTING);
          messageData.content = 'Reconnecting...';
        }
        break;
      case MessageType.TEXT: {
        break;
      }
      case MessageType.PLAYER_INFO: {
        messageData.content = `${messageData.host.name} started video player`;
        if (!isInitMsg) {
          this.setPlayerExists(true);
          this.setPlayerData(messageData);
        }
        break;
      }
      case MessageType.PLAYER_SYNC: {
        !this.isHost && this.setPlayerData({ ...this.syncedPlayerData, ...messageData });
        return {};
      }
      case MessageType.PLAYER_END: {
        messageData.content = `${messageData.host.name} stopped video player`;
        if (!isInitMsg) {
          this.setPlayerExists(false);
          this.setPlayerData(null);
        }
        break;
      }
      case MessageType.CHAT_DELETE:
        if (this.isGroupChat || this.chatStatus === ChatStatus.NOT_STARTED) {
          messageData.content = 'Room no longer exists';
        } else {
          messageData.content = `${this.name} left`;
        }
        this.closeChatSession();
        break;
      case MessageType.RECONNECTING:
        messageData.content = 'Reconnecting...';
        this.setChatStatus(ChatStatus.RECONNECTING);
        break;
      case MessageType.DISCONNECTED:
        messageData.content = 'Disconnected';
        this.closeChatSession();
        break;

      default:
        log.error('Unsupported message type', messageType);
        return {};
    }
    return payload;
  };

  addMessage = (payload) => this.messageList.push(payload);

  addInitMessageList = (messageList) => {
    this.messageList = messageList.concat(this.messageList);
  };

  closeChatSession = () => {
    this.setChatStatus(ChatStatus.ENDED);
    this.setShouldOpenPlayer(false);
    if (this.socket) {
      this.handlePlayerDelete();
      this.socket.close();
      this.socket = null;
    }
  };

  setChatStatus = (status) => {
    this.chatStatus = status;
  };

  toggleLikeRoom = () => {
    let fetchData = { body: { like: !this.roomInfo.isFavorite } };
    if (this.isGroupChat) {
      fetchData = {
        ...fetchData,
        headers: { 'X-Group-Password': this.roomInfo.password },
      };
    }
    fetchUrl(`/api/chat/${this.roomType}_rooms/${this.roomInfo.roomId}/set_like/`, {
      ...fetchData,
      method: 'post',
    })
      .then(() => this.setRoomInfo({ ...this.roomInfo, isFavorite: !this.roomInfo.isFavorite }))
      .catch(() => {
        const alertText = profileStore.isLoggedIn
          ? 'Unable to change favorite status.'
          : 'Login required to change favorite status';
        this.appStore.showAlert({
          severity: 'error',
          action: 'login',
          text: alertText,
        });
      });
  };

  syncPlayer = () => {
    let fetchData;
    if (this.isGroupChat) {
      fetchData = {
        headers: { 'X-Group-Password': this.roomInfo.password },
      };
    }
    this.appStore.showWaitScreen('Syncing player');
    return fetchUrl(
      `/api/chat/${this.roomType}_rooms/${this.roomInfo.roomId}/get_player/`,
      fetchData
    )
      .then((response) => {
        this.setPlayerData(response.data);
      })
      .catch(() => {
        this.appStore.showAlert({
          severity: 'error',
          text: 'Error occurred while fetching player data',
        });
      })
      .finally(() => {
        this.appStore.setShouldShowWaitScreen(false);
      });
  };

  handlePlayerDelete = () => {
    if (this.isHost) {
      this.setPlayerExists(false);
      this.socket.send(MessageType.PLAYER_END);
    }
    this.setPlayerData(null);
  };

  togglePlayerOpen = () => {
    if (!this.shouldOpenPlayer) {
      this.syncPlayer();
    } else {
      this.handlePlayerDelete();
    }
    this.setShouldOpenPlayer(!this.shouldOpenPlayer);
  };
}

export default ChatWindowStore;
