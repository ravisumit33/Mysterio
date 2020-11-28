import Message from 'constants.js';
import log from 'loglevel';
import { action, makeObservable, observable } from 'mobx';
import ReconnectingWebSocket from 'reconnecting-websocket';

class ChatWindowStore {
  id = undefined;

  roomId = undefined;

  messageList = [];

  socket = null;

  isWidnowMinimized = false;

  constructor(id, roomId) {
    makeObservable(this, {
      id: observable,
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
    });
    this.initState(id, roomId);
  }

  initState(id, roomId) {
    this.id = id;
    this.roomId = roomId;
    this.initSocket();
  }

  initSocket() {
    const SERVER_ADD = window.location.host.split(':')[0];
    const groupChatURL = this.roomId ? `/${this.roomId}` : '';
    this.socket = new ReconnectingWebSocket(`ws://${SERVER_ADD}:8000/ws/chat${groupChatURL}`);
    this.socket.addEventListener('open', this.handleSocketOpen);
    this.socket.addEventListener('close', this.handleSocketClose);
    this.socket.addEventListener('message', this.handleSocketMessage);
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
      case Message.USER_JOINED:
        message.data.text = 'User joined';
        break;
      case Message.USER_LEFT:
        if (!this.roomId) {
          // individual_room's user left
          this.handleEndChat();
        }
        message.data.text = 'User left';
        break;
      case Message.TEXT:
        message.data.text = messageData.text;
        break;
      default:
        log.error('Unsupported message type', messageType);
        break;
    }
    this.messageList.push(message);
  }

  handleSocketSend(message) {
    log.info('send over socket', message);
    const payload = {
      type: Message.TEXT,
      data: {
        text: message,
      },
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
    this.initSocket();
  }
}

export default ChatWindowStore;
