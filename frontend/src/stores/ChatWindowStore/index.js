import { makeAutoObservable } from 'mobx';
import { ChatStatus, MatchTimeout, MessageType, RoomType } from 'appConstants';
import log from 'loglevel';
import { fetchUrl, isEmptyObj } from 'utils';
import { updateStoredChatWindowData } from 'utils/browserStorageUtils';
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

  initState = ({ roomId = '', password = '', isGroupRoom = false, name = '', avatarUrl = '' }) => {
    this.setRoomInfo({
      ...this.roomInfo,
      roomId,
      isGroupRoom,
      password,
    });
    this.setName(name);
    this.setAvatarUrl(avatarUrl);
    this.setPreviousMessagesInfo({ ...this.previousMessagesInfo, fetchingPreviousMessages: false });
    const initPromise = isGroupRoom ? this.initializeForGroup() : this.initializeForIndividual();
    return initPromise;
  };

  syncRoomData = (requestData = {}) =>
    fetchUrl(`/api/chat/rooms/${this.roomInfo.roomId}/`, { ...requestData })
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
        const { player, room_data: roomData } = data;
        if (this.isGroupChat) {
          const { name, avatar_url: avatarUrl } = roomData;
          this.setName(name);
          this.setAvatarUrl(avatarUrl);
          updateStoredChatWindowData(RoomType.GROUP, this.roomInfo.roomId, { name, avatarUrl });
        }
        if (player) {
          this.setSyncedPlayerData(player);
          this.setPlayerExists(true);
        }
        this.setPreviousMessagesInfo({
          ...this.previousMessagesInfo,
          next: `/api/chat/messages/?search=${this.roomInfo.roomId}&page_size=250&ordering=-sent_at`,
        });
        await this.loadPreviousMessages(requestData);
        if (!this.isGroupChat) {
          // Show USER_JOINED message when user re-joins an individual chat
          this.addInitMessageList([
            {
              type: MessageType.USER_JOINED,
              data: { content: `You are matched to ${this.name}` },
            },
          ]);
        }
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
      headers: { 'X-Room-Password': this.roomInfo.password },
    }).then(async (data) => {
      // @ts-ignore
      const { room_data: roomData } = data;
      const {
        admin_access: adminAccess,
        is_favorite: isFavorite,
        is_creator: isCreator,
      } = roomData;
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

  setRoomInfo = (newRoomInfo) => {
    this.roomInfo = newRoomInfo;
  };

  setPreviousMessagesInfo = (newPreviousMessagesInfo) => {
    this.previousMessagesInfo = newPreviousMessagesInfo;
  };

  setSyncedPlayerData = (newPlayerData) => {
    this.syncedPlayerData = newPlayerData;
  };

  setPlayerExists = (newPlayerExists) => {
    this.playerExists = newPlayerExists;
  };

  get isGroupChat() {
    return this.roomInfo.isGroupRoom;
  }

  get roomType() {
    return this.roomInfo.isGroupRoom ? RoomType.GROUP : RoomType.INDIVIDUAL;
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
                message.data.content = message.data.content.text;
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
        let newChatStatus = ChatStatus.ONGOING;
        if (this.chatStatus === ChatStatus.NOT_STARTED) {
          /*
           * If chat is not started, then it can be because of following reasons:
           * 1. User is joining a group chat
           * 2. User got match in an individual chat
           * 3. User is rejoining an individual chat
           */
          if (this.isGroupChat) {
            messageData.content = `${messageData.newJoinee.name} entered`;
          } else if ('match' in messageData) {
            clearTimeout(this.matchTimeout);
            this.setName(messageData.match.name);
            this.setAvatarUrl(messageData.match.avatarUrl);
            updateStoredChatWindowData(RoomType.INDIVIDUAL, messageData.room_id, {
              name: messageData.match.name,
              avatarUrl: messageData.match.avatarUrl,
            });
            this.setRoomInfo({ ...this.roomInfo, roomId: messageData.room_id });
            messageData.content = `You are matched to ${messageData.match.name}`;
          } else if (messageData.is_room_inactive) {
            messageData.content = 'Reconnecting...';
            // @ts-ignore
            newChatStatus = ChatStatus.RECONNECTING;
          } else {
            messageData.content = 'Connection restored';
          }
        } else if (this.chatStatus === ChatStatus.RECONNECTING) {
          messageData.content = 'Connection restored';
        } else if (this.chatStatus === ChatStatus.ONGOING && this.isGroupChat) {
          messageData.content = `${messageData.newJoinee.name} entered`;
        }
        if (!isInitMsg) {
          this.setChatStatus(newChatStatus);
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
          this.setSyncedPlayerData(messageData);
        }
        break;
      }
      case MessageType.PLAYER_SYNC: {
        !this.isHost && this.setSyncedPlayerData({ ...this.syncedPlayerData, ...messageData });
        return {};
      }
      case MessageType.PLAYER_END: {
        messageData.content = `${messageData.host.name} stopped video player`;
        if (!isInitMsg) {
          this.setPlayerExists(false);
          this.setSyncedPlayerData(null);
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
    let fetchData = { body: { room_data: { favorite: !this.roomInfo.isFavorite } } };
    if (this.isGroupChat) {
      fetchData = {
        ...fetchData,
        headers: { 'X-Room-Password': this.roomInfo.password },
      };
    }
    fetchUrl(`/api/chat/rooms/${this.roomInfo.roomId}/`, {
      ...fetchData,
      method: 'patch',
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
        headers: { 'X-Room-Password': this.roomInfo.password },
      };
    }
    this.appStore.showWaitScreen('Syncing player');
    return fetchUrl(`/api/chat/players/?search=${this.roomInfo.roomId}`, fetchData)
      .then((response) => {
        this.setSyncedPlayerData(response.data[0]);
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

  updatePlayer = (playerData) => {
    const fetchData = {
      body: { ...playerData },
    };
    if (this.isGroupChat) {
      fetchData.headers = { 'X-Room-Password': this.roomInfo.password };
    }
    fetchUrl(`/api/chat/players/${this.syncedPlayerData.id}/`, {
      ...fetchData,
      method: 'patch',
    });
  };

  handlePlayerDelete = () => {
    if (this.isHost) {
      this.setPlayerExists(false);
      this.socket.send(MessageType.PLAYER_END);
    }
    this.setSyncedPlayerData(null);
  };
}

export default ChatWindowStore;
