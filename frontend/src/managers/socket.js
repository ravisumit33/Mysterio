import ReconnectingWebSocket from 'reconnecting-websocket';
import log from 'loglevel';
import { ChatStatus, MessageType, MysterioHost, ReconnectTimeout, RoomType } from 'appConstants';
import { isCordovaEnv, isDevEnv, isEmptyObj } from 'utils';
import BaseManager from './base';

class SocketManager extends BaseManager {
  maxRetries = 10;

  constructor(chatManager, getCtx) {
    super(getCtx);
    this.chatManager = chatManager;
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
      const { chatRoomStore } = this.stores;
      const { roomInfo, roomType } = chatRoomStore;
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
    const { sessionId, name, avatarUrl } = this.stores.profileStore;
    const { waitUntilProfileReady } = this.actions;
    waitUntilProfileReady().then(() => {
      this.send(MessageType.USER_INFO, { sessionId, name, avatarUrl });
    });
  };

  handleClose = () => {
    log.info('socket connection closed', this.socket);
    const { chatStatus } = this.stores.chatRoomStore;
    if (chatStatus === ChatStatus.ONGOING) {
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
    this.chatManager.addMessage(payload);
  };

  handleError = (error) => {
    log.error('Error connecting to server\n', error);
    const { chatStatus } = this.stores.chatRoomStore;
    if (this.socket.retryCount >= this.maxRetries) {
      if (chatStatus === ChatStatus.NOT_STARTED) {
        const { appStore } = this.chatManager;
        appStore.removeChatWindow();
        const { showAlert } = this.actions;
        showAlert({
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

export default SocketManager;
