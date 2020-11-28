import MessageType from 'constants.js';
import log from 'loglevel';
import { action, makeObservable, observable } from 'mobx';
import ReconnectingWebSocket from 'reconnecting-websocket';
import profileStore from 'stores/profileStore';

class ChatWindowStore {
  avatarUrl = '';

  name = '';

  roomId = undefined;

  messageList = [];

  socket = null;

  isWidnowMinimized = false;

  constructor(roomId) {
    makeObservable(this, {
      avatarUrl: observable,
      name: observable,
      roomId: observable,
      messageList: observable.shallow,
      socket: observable,
      isWidnowMinimized: observable,
      handleSocketOpen: action.bound,
      handleSocketClose: action.bound,
      handleSocketMessage: action.bound,
      handleSocketSend: action.bound,
      handleEndChat: action.bound,
      handleReconnectChat: action.bound,
      toggleWindowMinimized: action.bound,
      setName: action.bound,
      setAvatarUrl: action.bound,
    });
    this.initState(roomId);
  }

  initState(roomId, stores) {
    this.roomId = roomId;
    // TODO: set group name if groupChat
    this.initSocket();
  }

  setName(newName) {
    this.name = newName;
  }

  setAvatarUrl(url) {
    this.avatarUrl = url;
  }

  initSocket() {
    const SERVER_ADD = window.location.host.split(':')[0];
    const groupChatURL = this.roomId ? `/${this.roomId}` : '';
    this.socket = new ReconnectingWebSocket(`ws://${SERVER_ADD}:8000/ws/chat${groupChatURL}`);
    this.socket.addEventListener('open', this.handleSocketOpen);
    this.socket.addEventListener('close', this.handleSocketClose);
    this.socket.addEventListener('message', this.handleSocketMessage);
    this.handleSocketSend(MessageType.USER_INFO, { name: profileStore.name });
  }

  handleSocketOpen() {
    log.info('socket connection established, try sending messages', this.socket);
  }

  handleSocketClose() {
    log.info('socket connection closed, try later', this.socket);
  }

  handleSocketMessage(event) {
    log.warn('handleSocketMessage', event.data);
    const payload = JSON.parse(event.data);
    const messageType = payload.type;
    const messageData = payload.data;
    const author = this.messageList.length % 2 ? 'them' : 'me';
    const message = { author, type: 'text', data: {} };
    switch (messageType) {
      case MessageType.USER_JOINED:
        if ('match' in messageData) {
          // This is individual chat
          this.setName(messageData.match.name);
          this.setAvatarUrl(messageData.match);
        }
        message.data.text = `You are connected to ${this.name}`;
        break;
      case MessageType.USER_LEFT:
        this.handleEndChat();
        message.data.text = 'User left';
        break;
      case MessageType.TEXT:
        message.data.text = messageData.text;
        break;
      default:
        log.error('Unsupported message type', messageType);
        break;
    }
    this.messageList.push(message);
  }

  handleSocketSend(msgType, message) {
    log.info('send over socket', message);
    const payload = {
      type: msgType,
      data: message,
    };
    this.socket.send(JSON.stringify(payload));
  }

  handleEndChat() {
    this.socket.close();
  }

  toggleWindowMinimized() {
    this.isWidnowMinimized = !this.isWidnowMinimized;
  }

  handleReconnectChat() {
    log.warn('handleReconnectChat', this.socket);
    this.socket.close();
    // this.initSocket();
  }
}

export default ChatWindowStore;
