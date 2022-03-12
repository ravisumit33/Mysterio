import ReconnectingWebSocket from 'reconnecting-websocket';
import log from 'loglevel';
import { ChatStatus, MessageType, MysterioHost } from 'appConstants';
import { isCordovaEnv, isDevEnv, isEmptyObj } from 'utils';
import Cryptor from './cryptor';

class Socket {
  maxRetries = 5;

  keyPair = null;

  secretKey = null;

  iv = null;

  cryptor = new Cryptor();

  constructor(chatWindowStore, profileStore) {
    this.chatWindowStore = chatWindowStore;
    this.profileStore = profileStore;
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

    this.cryptor.getKeyPair().then(async (keyPair) => {
      const pubKey = await Cryptor.exportKey(keyPair.publicKey);
      this.send(MessageType.USER_INFO, {
        sessionId: this.profileStore.sessionId,
        name: this.profileStore.name,
        avatarUrl: this.profileStore.avatarUrl,
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
            session_id: this.profileStore.sessionId,
            name: this.profileStore.name,
            avatarUrl: this.profileStore.avatarUrl,
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
      appStore.setShouldShowAlert(false);
      appStore.showAlert({
        text: `Error occured while connecting to server.`,
        severity: 'error',
      });
      appStore.removeChatWindow();
    } else {
      log.info('Reconnecting...');
    }
  };

  send = async (msgType, msgData = {}) => {
    const payloadData = msgData;
    switch (msgType) {
      case MessageType.TEXT: {
        const secretKey = await this.cryptor.getSecretKey();
        payloadData.content = await Cryptor.encryptText(payloadData.content, secretKey);
        break;
      }
      case MessageType.SECRET_KEY: {
        const pairWiseSecretKey = await this.cryptor.getPairwiseSecretKey(payloadData.receiverId);
        payloadData.secretKey = await Cryptor.encryptText(payloadData.secretKey, pairWiseSecretKey);
        break;
      }
      default:
        break;
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

  sendSecretKey = async (userId, pubKey) => {
    await this.cryptor.derivePairwiseSecretKey(userId, pubKey);
    const secretKey = await this.cryptor.getSecretKey();
    const secretKeyJson = await Cryptor.exportKey(secretKey);
    this.send(MessageType.SECRET_KEY, {
      secretKey: JSON.stringify(secretKeyJson),
      receiverId: userId,
    });
  };

  receiveSecretKey = async (userId, secretKeyStr) => {
    const pairWiseSecretKey = await this.cryptor.getPairwiseSecretKey(userId);
    const decryptedSecretKeyStr = await Cryptor.decryptText(secretKeyStr, pairWiseSecretKey);
    const decryptedSecretKey = await Cryptor.importKey(
      JSON.parse(decryptedSecretKeyStr),
      Cryptor.secretKeyConfig
    );
    this.cryptor.setSecretKeyForUser(userId, decryptedSecretKey);
  };

  receiveTextMsg = async (text, senderId, isOwnMsg) => {
    const senderSecretKey = await (isOwnMsg
      ? this.cryptor.getSecretKey()
      : this.cryptor.getSecretKeyForUser(senderId));
    const decryptedText = await Cryptor.decryptText(text, senderSecretKey);
    return decryptedText;
  };
}

export default Socket;
