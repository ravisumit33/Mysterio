import ReconnectingWebSocket from 'reconnecting-websocket';
import log from 'loglevel';
import { ChatStatus, MessageType, MysterioHost } from 'appConstants';
import { isCordovaEnv, isDevEnv, isEmptyObj } from 'utils';
import profileStore from '../ProfileStore';

class Socket {
  maxRetries = 60;

  keyPair = null;

  secretKey = null;

  iv = null;

  constructor(chatWindowStore) {
    this.chatWindowStore = chatWindowStore;
    this.init();
    this.iv = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
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

  generateKeyPair = async () => {
    this.keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-384',
      },
      true,
      ['deriveKey']
    );
  };

  deriveSecretKey = async (newUserPubKeyStr) => {
    const newUserPubKeyJson = JSON.parse(newUserPubKeyStr);
    const newUserPubKey = await window.crypto.subtle.importKey(
      'jwk',
      newUserPubKeyJson,
      {
        name: 'ECDH',
        namedCurve: 'P-384',
      },
      true,
      []
    );

    this.secretKey = await window.crypto.subtle.deriveKey(
      {
        name: 'ECDH',
        public: newUserPubKey,
      },
      this.keyPair.privateKey,
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  };

  encryptTextMsg = async (textMsg) => {
    const encoder = new TextEncoder();
    const encodedMsg = encoder.encode(textMsg);
    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: this.iv,
      },
      this.secretKey,
      encodedMsg
    );
    const ctArray = Array.from(new Uint8Array(ciphertext)); // ciphertext as byte array
    const ctStr = ctArray.map((byte) => String.fromCharCode(byte)).join(''); // ciphertext as string
    console.log(ciphertext);
    return btoa(ctStr);
  };

  decryptTextMsg = async (encodedTextMsg) => {
    console.log(encodedTextMsg);
    let decryptedTextMsg;
    try {
      const ctStr = atob(encodedTextMsg); // decode base64 ciphertext
      const buff = new Uint8Array(Array.from(ctStr).map((ch) => ch.charCodeAt(0)));
      console.log(buff);
      decryptedTextMsg = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: this.iv,
        },
        this.secretKey,
        buff
      );
    } catch (e) {
      log.error('Error in decrypting');
      log.error(e);
      return '';
    }
    const decoder = new TextDecoder();
    return decoder.decode(decryptedTextMsg);
  };

  handleOpen = () => {
    log.info('socket connection established');

    this.generateKeyPair().then(async () => {
      const pubKey = await window.crypto.subtle.exportKey('jwk', this.keyPair.publicKey);
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
      payloadData.text = await this.encryptTextMsg(payloadData.text);
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
