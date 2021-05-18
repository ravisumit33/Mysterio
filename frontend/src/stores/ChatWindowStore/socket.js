import ReconnectingWebSocket from 'reconnecting-websocket';
import log from 'loglevel';
import { MessageType } from 'constants.js';
import profileStore from 'stores/ProfileStore';

class Socket {
  constructor(chatWindowStore) {
    this.chatWindowStore = chatWindowStore;
    this.init();
  }

  init() {
    const isDevEnv = process.env.NODE_ENV === 'development';
    const { host } = window.location;
    const SERVER_ADD = isDevEnv ? `${host.split(':')[0]}:8000` : host;
    const groupChatURL = this.chatWindowStore.roomId ? `/${this.chatWindowStore.roomId}` : '';
    this.socket = new ReconnectingWebSocket(`ws://${SERVER_ADD}/ws/chat${groupChatURL}`);
    this.socket.addEventListener('open', this.handleOpen);
    this.socket.addEventListener('close', this.handleClose);
    this.socket.addEventListener('message', this.handleMessage);
  }

  handleOpen = () => {
    log.info('socket connection established, try sending messages');
    this.send(MessageType.USER_INFO, { name: profileStore.name, avatar: profileStore.avatarUrl });
  };

  handleClose = () => {
    log.info('socket connection closed, try later', this.socket);
  };

  handleMessage = (event) => {
    log.warn('socket receive', event.data);
    const payload = JSON.parse(event.data);
    this.chatWindowStore.addMessage(payload);
  };

  send = (msgType, msgData) => {
    log.info('send over socket', msgData);
    const payload = {
      type: msgType,
      data: msgData,
    };
    this.socket.send(JSON.stringify(payload));
  };

  close = () => {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  };
}

export default Socket;
