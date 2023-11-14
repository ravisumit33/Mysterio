import ReconnectingWebSocket from 'reconnecting-websocket';
import log from 'loglevel';
import { ChatStatus, MessageType, MysterioHost, ReconnectTimeout, RoomType } from 'appConstants';
import { isCordovaEnv, isDevEnv, isEmptyObj } from 'utils';
import profileStore from '../ProfileStore';

class Socket {
  maxRetries = 10;

  constructor(chatWindowStore) {
    this.chatWindowStore = chatWindowStore;
    this.init();
  }

  init() {
    const getWsUrl = () => {
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
      const { roomInfo, roomType } = this.chatWindowStore;
      if (roomType === RoomType.INDIVIDUAL && !roomInfo.roomId) {
        return `${websocketProtocol}://${serverHost}/ws/chat/match/`;
      }
      return `${websocketProtocol}://${serverHost}/ws/chat/${roomType}/${roomInfo.roomId}/`;
    };

    this.socket = new ReconnectingWebSocket(getWsUrl, undefined, { maxRetries: this.maxRetries });
    this.socket.addEventListener('open', this.handleOpen);
    this.socket.addEventListener('close', this.handleClose);
    this.socket.addEventListener('message', this.handleMessage);
    this.socket.addEventListener('error', this.handleError);
  }

  handleOpen = () => {
    log.info('socket connection established');
    profileStore.userInfoCompletedPromise.then(() => {
      this.send(MessageType.USER_INFO, {
        sessionId: profileStore.sessionId,
        name: profileStore.name,
        avatarUrl: profileStore.avatarUrl,
      });
    });
  };

  handleClose = () => {
    log.info('socket connection closed', this.socket);
    if (this.chatWindowStore.chatStatus === ChatStatus.ONGOING) {
      this.reconnectStart = Date.now();
      const message = {
        type: MessageType.RECONNECTING,
        data: {},
      };
      const evt = { data: JSON.stringify(message) };
      this.handleMessage(evt);
    }
  };

  handleMessage = (event) => {
    const payload = JSON.parse(event.data);
    const processedMessage = this.chatWindowStore.processMessage(payload);
    !isEmptyObj(processedMessage) && this.chatWindowStore.addMessage(payload);
  };

  handleError = (error) => {
    log.error('Error connecting to server\n', error);
    const { chatStatus } = this.chatWindowStore;
    if (this.socket.retryCount >= this.maxRetries) {
      if (chatStatus === ChatStatus.NOT_STARTED) {
        const { appStore } = this.chatWindowStore;
        appStore.removeChatWindow();
        appStore.setShouldShowAlert(false);
        appStore.showAlert({
          text: `Error occured while connecting to server.`,
          severity: 'error',
        });
      } else if (chatStatus === ChatStatus.RECONNECTING) {
        const message = {
          type: MessageType.DISCONNECTED,
          data: {},
        };
        const evt = { data: JSON.stringify(message) };
        this.handleMessage(evt);
      }
    } else if (chatStatus === ChatStatus.RECONNECTING) {
      const timeElapsed = Date.now() - this.reconnectStart;
      if (timeElapsed >= ReconnectTimeout) {
        const message = {
          type: MessageType.DISCONNECTED,
          data: {},
        };
        const evt = { data: JSON.stringify(message) };
        this.handleMessage(evt);
      }
    } else {
      log.info('Reconnecting...');
    }
  };

  send = (msgType, msgData = {}) => {
    if (this.socket) {
      const payload = {
        type: msgType,
        data: msgData,
      };
      this.socket.send(JSON.stringify(payload));
    }
  };

  close = () => {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  };
}

export default Socket;
