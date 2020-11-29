import ReconnectingWebSocket from 'reconnecting-websocket';
import log from 'loglevel';
import MessageType from 'constants.js';
import profileStore from 'stores/ProfileStore';

class Socket {
  constructor(chatWindowStore) {
    this.chatWindowStore = chatWindowStore;
    this.init();
  }

  init() {
    const SERVER_ADD = window.location.host.split(':')[0];
    const groupChatURL = this.chatWindowStore.roomId ? `/${this.chatWindowStore.roomId}` : '';
    this.socket = new ReconnectingWebSocket(`ws://${SERVER_ADD}:8000/ws/chat${groupChatURL}`);
    this.socket.addEventListener('open', this.handleOpen.bind(this));
    this.socket.addEventListener('close', this.handleClose.bind(this));
    this.socket.addEventListener('message', this.handleMessage.bind(this));
  }

  handleOpen() {
    log.info('socket connection established, try sending messages');
    this.send(MessageType.USER_INFO, { name: profileStore.name, avatar: profileStore.avatarUrl });
  }

  handleClose() {
    log.info('socket connection closed, try later', this.socket);
  }

  handleMessage(event) {
    log.warn('socket receive', event.data);
    const payload = JSON.parse(event.data);
    const messageType = payload.type;
    const messageData = payload.data;
    const author = this.chatWindowStore.messageList.length % 2 ? 'them' : 'me';
    const message = { author, type: 'text', data: {} };
    switch (messageType) {
      case MessageType.USER_JOINED:
        if ('match' in messageData) {
          this.chatWindowStore.setName(messageData.match.name);
          this.chatWindowStore.setAvatarUrl(messageData.match.avatarUrl);
        }
        message.data.text = this.chatWindowStore.isGroupChat
          ? `${messageData.newJoinee.name} entered`
          : `You are connected to ${messageData.match.name}`;
        break;
      case MessageType.USER_LEFT:
        message.data.text = `${messageData.resignee.name} left`;
        if (!this.chatWindowStore.isGroupChat) {
          this.close();
        }
        break;
      case MessageType.TEXT:
        message.data.text = messageData.text;
        break;
      default:
        log.error('Unsupported message type', messageType);
        break;
    }
    this.chatWindowStore.addMessage(message);
    if (!this.chatWindowStore.isGroupChat && messageType === MessageType.USER_LEFT) {
      this.chatWindowStore.setReconnectStatus(true);
    }
  }

  send(msgType, msgData) {
    log.info('send over socket', msgData);
    const payload = {
      type: msgType,
      data: msgData,
    };
    this.socket.send(JSON.stringify(payload));
  }

  close() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  handleReconnectChat() {
    log.warn('handleReconnectChat', this.socket);
    this.socket.close();
    // TODO
  }
}

export default Socket;
