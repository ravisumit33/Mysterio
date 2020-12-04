import { action, computed, makeObservable, observable } from 'mobx';
import MessageType from 'constants.js';
import log from 'loglevel';
import profileStore from 'stores/ProfileStore';
import Socket from './socket';

class ChatWindowStore {
  avatarUrl = '';

  name = '';

  roomId = undefined;

  messageList = [];

  isWindowMinimized = false;

  shouldReconnect = false;

  hasUnreadMessages = false;

  socket = new Socket(this);

  constructor(roomId) {
    makeObservable(this, {
      avatarUrl: observable,
      name: observable,
      roomId: observable,
      messageList: observable,
      isWindowMinimized: observable,
      shouldReconnect: observable,
      hasUnreadMessages: observable,
      socket: observable,
      setWindowMinimized: action.bound,
      setName: action.bound,
      setAvatarUrl: action.bound,
      isGroupChat: computed,
      addMessage: action.bound,
      setReconnectStatus: action.bound,
      reconnect: action.bound,
      closeChatWindow: action.bound,
      initState: action.bound,
      setUnreadMessageStatus: action.bound,
    });
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
        break;
      case MessageType.USER_LEFT:
        messageData.text = [`${messageData.resignee.name} left`];
        if (!this.isGroupChat) {
          this.socket.close();
          this.setReconnectStatus(true);
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

  setReconnectStatus(status) {
    this.shouldReconnect = status;
  }

  setUnreadMessageStatus(status) {
    this.hasUnreadMessages = status;
  }
}

export default ChatWindowStore;
