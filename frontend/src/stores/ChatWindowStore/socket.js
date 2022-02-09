import ReconnectingWebSocket from 'reconnecting-websocket';
import log from 'loglevel';
import { ChatStatus, MessageType, MysterioHost } from 'appConstants';
import { isCordovaEnv, isDevEnv, isEmptyObj } from 'utils';
import profileStore from '../ProfileStore';
import Encryption from './encryption';

class Socket {
  maxRetries = 60;

  keyPair = null;

  secretKey = null;

  iv = null;

  encrypter = new Encryption();

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
      `${websocketProtocol}://${serverHost}/chat${groupChatURL}/`,
      undefined,
      { maxRetries: this.maxRetries }
    );
    this.socket.addEventListener('open', this.handleOpen);
    this.socket.addEventListener('close', this.handleClose);
    this.socket.addEventListener('message', this.handleMessage);
    this.socket.addEventListener('error', this.handleError);
  }

  handleOpen = () => {
    log.info('socket connection established');

    this.encrypter.generateKeyPair().then(async () => {
      const pubKey = await window.crypto.subtle.exportKey('jwk', this.encrypter.keyPair.publicKey);
      this.send(MessageType.USER_INFO, {
        sessionId: profileStore.sessionId,
        name: profileStore.name,
        avatarUrl: profileStore.avatarUrl,
        pubKey: JSON.stringify(pubKey),
      });
    });
  };

  handleClose = () => {
    log.info('socket connection closed', this.socket);
    if (this.chatWindowStore.chatStatus === ChatStatus.ONGOING) {
      this.chatWindowStore.setChatStatus(ChatStatus.NOT_STARTED);
      // Show self left message by emulating server message
      const message = {
        type: MessageType.USER_LEFT,
        data: {
          resignee: {
            session_id: profileStore.sessionId,
            name: profileStore.name,
            avatarUrl: profileStore.avatarUrl,
          },
        },
      };
      const evt = { data: JSON.stringify(message) };
      this.handleMessage(evt);
    }
  };

  handleMessage = (event) => {
    const payload = JSON.parse(event.data);
    this.chatWindowStore.processMessage(payload).then((processedMessage) => {
      !isEmptyObj(processedMessage) && this.chatWindowStore.addMessage(payload);
    });
  };

  handleError = (error) => {
    log.error('Error connecting to server', error);
    if (this.socket.retryCount >= this.maxRetries) {
      const { appStore } = this.chatWindowStore;
      appStore.removeChatWindow();
      appStore.setShouldShowAlert(false);
      appStore.showAlert({
        text: `Error occured while connecting to server.`,
        severity: 'error',
      });
    } else {
      log.info('Reconnecting...');
    }
  };

  send = async (msgType, msgData = {}) => {
    const payloadData = msgData;
    if (msgType === MessageType.TEXT) {
      payloadData.text = await this.encrypter.encryptTextMsg(payloadData.text);
    }
    const payload = {
      type: msgType,
      data: payloadData,
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
