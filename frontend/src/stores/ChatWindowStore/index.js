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

  shouldOpenPlayer = false;

  playerData = {};

  constructor({ appStore, data }) {
    makeAutoObservable(this);
    this.appStore = appStore;
    this.chatStartedPromiseObj = createDeferredPromiseObj();
    this.initState(data || {});
    this.socket = new Socket(this);
  }

  reset = () => {
    this.shouldOpenPlayer = false;
    this.chatStartedPromiseObj = createDeferredPromiseObj();
    this.initDone = false;
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
    isGroupRoom ? this.initializeForGroup() : this.initializeForIndividual();
  };

  initializeForIndividual = () => {
    this.chatStartedPromiseObj.promise.then(() => this.setInitDone(true));
    this.setRoomInfo({ ...this.roomInfo, adminAccess: true });
  };

  initializeForGroup = () => {
    const groupDetail = fetchUrl(`/api/chat/group_rooms/${this.roomInfo.roomId}/`, {
      headers: { 'X-Group-Password': this.roomInfo.password },
    }).then((response) => {
      const { data } = response;
      // @ts-ignore
      this.setPlayerData(data.player || {});
      // @ts-ignore
      const adminAccess = data.admin_access;
      this.setRoomInfo({ ...this.roomInfo, adminAccess });
      return data;
    });
    // @ts-ignore
    const groupMessages = groupDetail.then((responseData) => responseData.group_messages);
    groupMessages
      .then((messages) => {
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
          this.setInitDone(true);
          this.closeChatWindow();
        } else {
          detailMessages = messages.map((msg) => {
            const message = {
              data: {},
            };
            message.data.text = msg.text;
            message.type = msg.message_type;
            const chatSessionData = msg.sender_channel.chat_session;
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
        this.roomInfo.prevMessageList = [];
        const { prevMessageList } = this.roomInfo;
        detailMessages.forEach((msg) => {
          const processedMessage = this.processMessage(msg, true);
          if (!isEmptyObj(processedMessage)) {
            prevMessageList.push(processedMessage);
          }
        });
        prevMessageList.reverse();
        this.chatStartedPromiseObj.promise.then(() => {
          this.addInitMessageList(prevMessageList);
          this.setInitDone(true);
        });
      })
      .catch((err) => {
        log.error(err);
        this.setInitDone(true);
        this.appStore.removeChatWindow();
        this.appStore.showAlert({
          text: 'Error occured while connecting to server.',
          severity: 'error',
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
        if (!isInitMsg) {
          if ('match' in messageData) {
            clearTimeout(this.timeout);
            this.initState({
              name: messageData.match.name,
              avatarUrl: messageData.match.avatarUrl,
              roomId: messageData.room_id,
            });
          }
          messageData.text = this.isGroupChat
            ? [`${messageData.newJoinee.name} entered`]
            : [`You are connected to ${messageData.match.name}`];
          this.setChatStatus(ChatStatus.ONGOING);
          this.chatStartedPromiseObj.resolve();
        }
        break;
      case MessageType.USER_LEFT:
        if (!isInitMsg) {
          messageData.text = [`${messageData.resignee.name} left`];
          if (!this.isGroupChat) {
            this.socket.close();
            this.socket = null;
            this.setChatStatus(ChatStatus.ENDED);
            this.shouldOpenPlayer = false;
          }
        }
        break;
      case MessageType.TEXT: {
        const msgList = isInitMsg ? this.roomInfo.prevMessageList : this.messageList;
        const lastMessageIdx = msgList.length - 1;
        const lastMessage = lastMessageIdx >= 0 && msgList[lastMessageIdx];
        if (
          lastMessage &&
          lastMessage.type === MessageType.TEXT &&
          lastMessage.data.sender &&
          messageData.sender &&
          lastMessage.data.sender.session_id === messageData.sender.session_id
        ) {
          const newLastMessage = { ...lastMessage };
          isInitMsg
            ? newLastMessage.data.text.unshift(messageData.text)
            : newLastMessage.data.text.push(messageData.text);
          msgList[lastMessageIdx] = newLastMessage;
          return {};
        }
        messageData.text = [messageData.text];
        break;
      }
      case MessageType.PLAYER_INFO: {
        if (!isInitMsg) {
          this.shouldOpenPlayer && this.setPlayerData(messageData);
          messageData.text = [`${messageData.host.name} started video player`];
        }
        break;
      }
      case MessageType.PLAYER_SYNC: {
        this.shouldOpenPlayer &&
          !this.isHost &&
          this.setPlayerData({ ...this.playerData, ...messageData });
        return {};
      }
      case MessageType.PLAYER_END: {
        if (!isInitMsg) {
          messageData.text = [`${messageData.host.name} stopped video player`];
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
            type: 'error',
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
