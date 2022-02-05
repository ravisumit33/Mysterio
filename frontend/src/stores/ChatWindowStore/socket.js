import ReconnectingWebSocket from 'reconnecting-websocket';
import log from 'loglevel';
import { MessageType, MysterioHost } from 'appConstants';
import { isCordovaEnv, isDevEnv, isEmptyObj } from 'utils';
import profileStore from '../ProfileStore';

class Socket {
  constructor(chatWindowStore) {
    this.chatWindowStore = chatWindowStore;
    this.init();
  }

  init() {
    let serverHost;
    let websocketProtocol;
    if (isCordovaEnv()) {
      serverHost = MysterioHost;
      websocketProtocol = 'wss';
    } else {
      const { host } = window.location;
      serverHost = isDevEnv() ? `${host.split(':')[0]}:8000` : host;
      websocketProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    }
    const { roomInfo } = this.chatWindowStore;
    const groupChatURL = roomInfo.roomId ? `/${roomInfo.roomId}` : '';
    this.socket = new ReconnectingWebSocket(
      `${websocketProtocol}://${serverHost}/chat${groupChatURL}/`
    );
    this.socket.addEventListener('open', this.handleOpen);
    this.socket.addEventListener('close', this.handleClose);
    this.socket.addEventListener('message', this.handleMessage);
    this.socket.addEventListener('error', this.handleError);
  }

  handleOpen = () => {
    log.info('socket connection established, try sending messages');
    this.send(MessageType.USER_INFO, {
      sessionId: profileStore.sessionId,
      name: profileStore.name,
      avatarUrl: profileStore.avatarUrl,
    });
  };

  handleClose = () => {
    log.info('socket connection closed, try later', this.socket);
  };

  handleMessage = (event) => {
    const payload = JSON.parse(event.data);
    const processedMessage = this.chatWindowStore.processMessage(payload);
    !isEmptyObj(processedMessage) && this.chatWindowStore.addMessage(payload);
  };

  handleError = (error) => {
    const { appStore } = this.chatWindowStore;
    appStore.removeChatWindow();
    appStore.setShouldShowAlert(false);
    appStore.showAlert({
      text: `Error occured while connecting to server.`,
      severity: 'error',
    });
  };

  send = (msgType, msgData = {}) => {
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
