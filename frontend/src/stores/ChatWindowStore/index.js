import { makeAutoObservable } from 'mobx';
import { ChatStatus, MatchTimeout, MessageType } from 'appConstants';
import log from 'loglevel';
import { fetchUrl, isEmptyObj } from 'utils';
import profileStore from '../ProfileStore';
import Socket from './socket';

class ChatWindowStore {
  chatSessionId = '';

  avatarUrl = '';

  name = '';

  messageList = [];

  chatStatus = ChatStatus.NOT_STARTED;

  initDone = false; // Chat started and initialization(if required) is done

  roomInfo = {};

  previousMessagesInfo = {};

  shouldOpenPlayer = false;

  playerExists = false; // player exists on server

  playerData = {}; // synced player information if player is opened

  constructor({ appStore, data }) {
    makeAutoObservable(this);
    this.appStore = appStore;
    this.initState(data || {});
  }

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
      this.socket = new Socket(this, profileStore);
    });
  };

  initializeForIndividual = () => {
    this.setRoomInfo({ ...this.roomInfo, adminAccess: true });
    return Promise.resolve();
  };

  initializeForGroup = async () => {
    await fetchUrl('/api/account/token/refresh/', { method: 'post' }).catch(() => {});
    return fetchUrl(`/api/chat/group_rooms/${this.roomInfo.roomId}/`, {
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
        const { player } = data;
        if (player) {
          this.setPlayerData(player);
          this.setPlayerExists(true);
        }
        // @ts-ignore
        const adminAccess = data.admin_access;
        // @ts-ignore
        const isFavorite = data.is_favorite;
        // @ts-ignore
        const isCreator = data.is_creator;
        // @ts-ignore
        const onlineUsers = data.online_users;
        this.setRoomInfo({
          ...this.roomInfo,
          adminAccess,
          isFavorite,
          isCreator,
          onlineUsers,
        });
        // @ts-ignore
        this.setPreviousMessagesInfo({ ...this.previousMessagesInfo, next: data.messages });
        await this.loadPreviousMessages();
      });
  };

  setChatSessionId = (newChatSessionId) => {
    this.chatSessionId = newChatSessionId;
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
    this.playerData = newPlayerData;
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

  get playerSynced() {
    return !isEmptyObj(this.playerData);
  }

  get isHost() {
    if (this.playerSynced) {
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
        detailMessages.forEach(async (msg) => {
          const processedMessage = await this.processMessage(msg, true);
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

  processMessage = async (payload, isInitMsg) => {
    const messageType = payload.type;
    const messageData = payload.data;
    switch (messageType) {
      case MessageType.USER_INFO: {
        const { profile } = messageData;
        this.setChatSessionId(profile.id);
        profileStore.setSessionId(profile.session_id);
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
      }
      case MessageType.USER_JOINED: {
        messageData.content = this.isGroupChat
          ? `${messageData.newJoinee.name} entered`
          : `You are connected to ${messageData.match.name}`;
        if (!isInitMsg) {
          let chatSetupPromise;
          if ('match' in messageData) {
            // Dual chat
            clearTimeout(this.timeout);
            this.setName(messageData.match.name);
            this.setAvatarUrl(messageData.match.avatarUrl);
            this.setRoomInfo({
              ...this.roomInfo,
              roomId: messageData.room_id,
              initialConnectionsCount: 1,
            });
            chatSetupPromise = this.socket.sendSecretKey(
              messageData.match.id,
              messageData.match.pubKey
            );
          } else if (this.initDone) {
            // Others join in group chat
            this.socket.sendSecretKey(messageData.newJoinee.id, messageData.newJoinee.pubKey);
          } else {
            // Self join in group chat
            const { onlineUsers } = this.roomInfo;
            const userSetupPromises = [];
            onlineUsers.forEach((user) => {
              userSetupPromises.push(
                this.socket.sendSecretKey(user.chat_session.id, user.chat_session.pub_key)
              );
            });
            chatSetupPromise = Promise.all(userSetupPromises);
          }
          if (chatSetupPromise) {
            this.setChatStatus(ChatStatus.ONGOING);
            this.setInitDone(true);
            chatSetupPromise.catch((err) => {
              this.appStore.setShouldShowAlert(false);
              this.appStore.showAlert({
                text: 'Something went wrong. Messages may not show properly.',
                severity: 'error',
              });
            });
          }
        }

        break;
      }
      case MessageType.SECRET_KEY: {
        this.socket.receiveSecretKey(messageData.sender.id, messageData.secretKey);
        return {};
      }
      case MessageType.USER_LEFT:
        messageData.content = `${messageData.resignee.name} left`;
        if (!isInitMsg) {
          if (!this.isGroupChat) {
            this.socket.close();
            this.socket = null;
            this.setChatStatus(ChatStatus.ENDED);
            this.setShouldOpenPlayer(false);
          }
        }
        break;
      case MessageType.TEXT: {
        const decryptedTextMsg = await this.socket.receiveTextMsg(
          messageData.content,
          messageData.sender.id,
          messageData.sender.id === this.chatSessionId
        );
        messageData.content = decryptedTextMsg;
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
        !this.isHost && this.setPlayerData({ ...this.playerData, ...messageData });
        return {};
      }
      case MessageType.PLAYER_END: {
        messageData.content = `${messageData.host.name} stopped video player`;
        if (!isInitMsg) {
          this.setPlayerExists(false);
          this.setPlayerData({});
        }
        break;
      }
      case MessageType.CHAT_DELETE:
        this.closeChatWindow();
        return {};
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

  closeChatWindow = () => {
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
        this.setPlayerData(response.data || {});
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
    this.setPlayerData({});
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
