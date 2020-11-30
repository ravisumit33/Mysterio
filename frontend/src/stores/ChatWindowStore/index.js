import { action, computed, makeObservable, observable } from 'mobx';
import Socket from './socket';

class ChatWindowStore {
  avatarUrl = '';

  name = '';

  roomId = undefined;

  messageList = [];

  isWindowMinimized = false;

  shouldReconnect = false;

  hasUnreadMessages = false;

  constructor(roomId) {
    makeObservable(this, {
      avatarUrl: observable,
      name: observable,
      roomId: observable,
      messageList: observable.shallow,
      isWindowMinimized: observable,
      shouldReconnect: observable,
      hasUnreadMessages: observable,
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
    this.socket = new Socket(this);
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

  addMessage(message) {
    this.messageList.push(message);
    this.isWindowMinimized && this.setUnreadMessageStatus(true);
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
