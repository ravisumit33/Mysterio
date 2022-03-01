import { makeAutoObservable } from 'mobx';
import { ChatStatus, MatchTimeout, MessageType } from 'appConstants';
import log from 'loglevel';
import { createDeferredPromiseObj, fetchUrl, isEmptyObj } from 'utils';
import profileStore from '../ProfileStore';
import Socket from './socket';

class ChatWindowStore {
  avatarUrl = '';

  name = '';

  messageList = [];

  chatStatus = ChatStatus.NOT_STARTED;

  initDone = false; // Chat started and initialization(if required) is done

  roomInfo = {};

  previousMessagesInfo = {};

  shouldOpenPlayer = false;

  playerData = {};

  constructor({ appStore, data }) {
    makeAutoObservable(this);
    this.appStore = appStore;
    this.chatStartedPromiseObj = createDeferredPromiseObj();
    this.initState(data || {});
  }

  reset = () => {
    this.setShouldOpenPlayer(false);
    this.chatStartedPromiseObj = createDeferredPromiseObj();
    this.setInitDone(false);
    // @ts-ignore
    this.messageList.clear();
  };

  initState = ({ roomId = '', name = '', avatarUrl = '', password = '', isGroupRoom = false }) => {
    this.setName(name);
    this.setAvatarUrl(avatarUrl);
    this.setRoomInfo({
      ...this.roomInfo,
      roomId,
      isGroupRoom,
      password,
    });
    this.setPreviousMessagesInfo({ ...this.previousMessagesInfo, fetchingPreviousMessages: false });
    const initPromise = isGroupRoom ? this.initializeForGroup() : this.initializeForIndividual();
    initPromise.then(() => {
      this.socket = new Socket(this);
      this.chatStartedPromiseObj.promise.then(() => this.setInitDone(true));
    });
  };

  initializeForIndividual = () => {
    this.setRoomInfo({ ...this.roomInfo, adminAccess: true });
    return Promise.resolve();
  };

  initializeForGroup = () =>
    fetchUrl('/api/account/token/refresh/', { method: 'post' }).finally(() => {
      fetchUrl(`/api/chat/group_rooms/${this.roomInfo.roomId}/`, {
        headers: { 'X-Group-Password': this.roomInfo.password },
      })
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
          this.setPlayerData(data.player || {});
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
          // @ts-ignore
          this.setPreviousMessagesInfo({ ...this.previousMessagesInfo, next: data.messages });
          await this.loadPreviousMessages();
        });
    });

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
    this.playerData = newPlayerData;
  };

  get isGroupChat() {
    return this.roomInfo.isGroupRoom;
  }

  get roomType() {
    return this.roomInfo.isGroupRoom ? 'group' : 'individual';
  }

  get playerExists() {
    return this.playerData.name;
  }

  get isHost() {
    if (this.playerExists) {
      const { host } = this.playerData;
      return profileStore.sessionId === host.session_id;
    }
    return false;
  }

  loadPreviousMessages = () => {
    const { next } = this.previousMessagesInfo;
    if (!next) return Promise.resolve(0);
    this.setPreviousMessagesInfo({ ...this.previousMessagesInfo, fetchingPreviousMessages: true });
    return fetchUrl(`${next}`, {
      headers: { 'X-Group-Password': this.roomInfo.password },
    })
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
          this.closeChatWindow();
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
      .finally((resp) => {
        this.setPreviousMessagesInfo({
          ...this.previousMessagesInfo,
          fetchingPreviousMessages: false,
        });
        if (resp instanceof Error) throw resp;
        return resp;
      });
  };

  processMessage = (payload, isInitMsg) => {
    const messageType = payload.type;
    const messageData = payload.data;
    switch (messageType) {
      case MessageType.USER_INFO:
        profileStore.setSessionId(messageData.session_id);
        if (!this.isGroupChat) {
          clearTimeout(this.timeout);
          this.timeout = setTimeout(
            (chatWindowStore) => {
              if (chatWindowStore.chatStatus === ChatStatus.NOT_STARTED) {
                chatWindowStore.socket.close();
                chatWindowStore.setChatStatus(ChatStatus.NO_MATCH_FOUND);
              }
            },
            MatchTimeout,
            this
          );
        }
        this.setChatStatus(ChatStatus.NOT_STARTED);
        return {};
      case MessageType.USER_JOINED:
        messageData.content = this.isGroupChat
          ? `${messageData.newJoinee.name} entered`
          : `You are connected to ${messageData.match.name}`;
        if (!isInitMsg) {
          if ('match' in messageData) {
            clearTimeout(this.timeout);
            this.initState({
              name: messageData.match.name,
              avatarUrl: messageData.match.avatarUrl,
              roomId: messageData.room_id,
            });
          }
          this.setChatStatus(ChatStatus.ONGOING);
          this.chatStartedPromiseObj.resolve();
        }
        break;
      case MessageType.USER_LEFT:
        messageData.content = `${messageData.resignee.name} left`;
        if (!isInitMsg) {
          if (!this.isGroupChat) {
            this.socket.close();
            this.socket = null;
            this.setChatStatus(ChatStatus.ENDED);
            this.shouldOpenPlayer = false;
          }
        }
        break;
      case MessageType.TEXT: {
        break;
      }
      case MessageType.PLAYER_INFO: {
        messageData.content = `${messageData.host.name} started video player`;
        if (!isInitMsg) {
          this.setPlayerData(messageData);
        }
        break;
      }
      case MessageType.PLAYER_SYNC: {
        !this.isHost && this.setPlayerData({ ...this.playerData, ...messageData });
        return {};
      }
      case MessageType.PLAYER_END: {
        messageData.content = `${messageData.host.name} stopped video player`;
        if (!isInitMsg) {
          this.setPlayerData({});
        }
        break;
      }
      case MessageType.CHAT_DELETE:
        this.closeChatWindow();
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

  reconnect = () => {
    this.setChatStatus(ChatStatus.RECONNECT_REQUESTED);
    this.reset();
    this.initState({});
    if (this.socket) {
      this.handlePlayerDelete();
      this.socket.close();
    }
    this.socket = new Socket(this);
  };

  closeChatWindow = () => {
    this.setChatStatus(ChatStatus.ENDED);
    this.socket && this.socket.close();
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
    fetchUrl(`/api/chat/${this.roomType}_rooms/${this.roomInfo.roomId}/get_player/`, fetchData)
      .then((response) => this.shouldOpenPlayer && this.setPlayerData(response.data))
      .catch(
        () =>
          this.shouldOpenPlayer &&
          this.appStore.showAlert({
            severity: 'error',
            text: 'Error occurred while fetching player data',
          })
      );
  };

  handlePlayerDelete = () => {
    if (this.isHost) {
      this.setPlayerData({});
      this.socket.send(MessageType.PLAYER_END);
    }
  };

  togglePlayerOpen = () => {
    if (!this.shouldOpenPlayer) {
      this.syncPlayer();
    } else {
      this.handlePlayerDelete();
    }
    this.shouldOpenPlayer = !this.shouldOpenPlayer;
  };
}

export default ChatWindowStore;
