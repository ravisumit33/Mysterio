import { makeAutoObservable } from 'mobx';
import { ChatStatus, MessageType } from 'constants.js';
import log from 'loglevel';
import profileStore from 'stores/ProfileStore';
import Socket from './socket';

class ChatWindowStore {
  avatarUrl = '';

  name = '';

  roomId = undefined;

  messageList = [];

  isWindowMinimized = false;

  chatStatus = ChatStatus.NOT_STARTED;

  hasUnreadMessages = false;

  socket = new Socket(this);

  constructor(roomId) {
    makeAutoObservable(this);
    this.initState(roomId);
  }

  initState(roomId, stores) {
    this.roomId = roomId;
    // TODO: set group name if groupChat
  }

  setName(newName) {
    this.name = newName;
  }

  setAvatarUrl(url) {
    this.avatarUrl = url;
  }

  setWindowMinimized(value) {
    this.isWindowMinimized = value;
  }

  get isGroupChat() {
    return !!this.roomId;
  }

  addMessage(payload) {
    this.isWindowMinimized && this.setUnreadMessageStatus(true);
    const messageType = payload.type;
    const messageData = payload.data;
    switch (messageType) {
      case MessageType.USER_INFO:
        profileStore.setId(messageData.id);
        return;
      case MessageType.USER_JOINED:
        if ('match' in messageData) {
          this.setName(messageData.match.name);
          this.setAvatarUrl(messageData.match.avatarUrl);
        }
        messageData.text = this.isGroupChat
          ? [`${messageData.newJoinee.name} entered`]
          : [`You are connected to ${messageData.match.name}`];
        this.setChatStatus(ChatStatus.ONGOING);
        break;
      case MessageType.USER_LEFT:
        messageData.text = [`${messageData.resignee.name} left`];
        if (!this.isGroupChat) {
          this.socket.close();
          this.setChatStatus(ChatStatus.ENDED);
        }
        break;
      case MessageType.TEXT: {
        const lastMessage = this.messageList[this.messageList.length - 1];
        if (
          lastMessage.type === MessageType.TEXT &&
          lastMessage.data.sender.id === messageData.sender.id
        ) {
          lastMessage.data.text.push(messageData.text);
          return;
        }
        messageData.text = [messageData.text];
        break;
      }
      default:
        log.error('Unsupported message type', messageType);
        return;
    }
    this.messageList.push(payload);
  }

  reconnect() {
    this.setChatStatus(ChatStatus.NOT_STARTED);
    this.setName('');
    // @ts-ignore
    this.messageList.clear();
    this.socket.close();
    this.socket = new Socket(this);
  }

  closeChatWindow() {
    this.socket.close();
    this.socket = null;
  }

  setChatStatus(status) {
    this.chatStatus = status;
  }

  setUnreadMessageStatus(status) {
    this.hasUnreadMessages = status;
  }
}

export default ChatWindowStore;
