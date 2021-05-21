import { makeAutoObservable } from 'mobx';
import { ChatStatus, MessageType } from 'constants.js';
import log from 'loglevel';
import profileStore from 'stores/ProfileStore';
import { fetchUrl } from 'utils';
import Socket from './socket';

class ChatWindowStore {
  avatarUrl = '';

  name = '';

  roomId = undefined;

  messageList = [];

  chatStatus = ChatStatus.NOT_STARTED;

  socket = null;

  chatStartedResolve = null;

  constructor(data) {
    makeAutoObservable(this);
    data && this.initState(data);
    this.socket = new Socket(this);
    const chatStartedPromise = new Promise((resolve, reject) => {
      this.chatStartedResolve = resolve;
    });
    if (this.isGroupChat) {
      chatStartedPromise.then(() => this.initializeForGroup());
    }
  }

  initializeForGroup = () => {
    const groupDetail = fetchUrl(`/api/chat/groups/${this.roomId}`);
    const groupMessages = groupDetail.then((data) => data.group_messages);
    groupMessages.then((messages) => {
      const detaiilMessages = messages.map((msg) => {
        const message = {
          data: {},
        };
        message.data.text = msg.text;
        message.type = msg.message_type;
        const sessionData = msg.sender_channel.session.data;
        switch (message.type) {
          case MessageType.TEXT:
            message.data.sender = sessionData;
            break;
          case MessageType.USER_JOINED:
            message.data.newJoinee = sessionData;
            break;
          case MessageType.USER_LEFT:
            message.data.resignee = sessionData;
            break;
          default:
            log.error('Unknown message type');
            break;
        }
        return message;
      });
      detaiilMessages.forEach((msg) => {
        this.addMessage(msg);
      });
    });
  };

  initState = ({ roomId, name }) => {
    this.roomId = roomId;
    this.name = name;
  };

  setName = (newName) => {
    this.name = newName;
  };

  setAvatarUrl = (url) => {
    this.avatarUrl = url;
  };

  get isGroupChat() {
    return !!this.roomId;
  }

  addMessage = (payload) => {
    const messageType = payload.type;
    const messageData = payload.data;
    switch (messageType) {
      case MessageType.USER_INFO:
        profileStore.setId(messageData.id);
        return;
      case MessageType.USER_JOINED:
        if ('match' in messageData) {
          this.setName(messageData.match.name);
          this.setAvatarUrl(messageData.match.avatarUrl);
        }
        messageData.text = this.isGroupChat
          ? this.chatStatus !== ChatStatus.NOT_STARTED && [`${messageData.newJoinee.name} entered`]
          : [`You are connected to ${messageData.match.name}`];
        this.setChatStatus(ChatStatus.ONGOING);
        this.chatStartedResolve();
        break;
      case MessageType.USER_LEFT:
        messageData.text = [`${messageData.resignee.name} left`];
        if (!this.isGroupChat) {
          this.socket.close();
          this.setChatStatus(ChatStatus.ENDED);
        }
        break;
      case MessageType.TEXT: {
        const lastMessage =
          this.messageList.length && this.messageList[this.messageList.length - 1];
        if (
          lastMessage &&
          lastMessage.type === MessageType.TEXT &&
          lastMessage.data.sender.id === messageData.sender.id
        ) {
          const newLastMessage = { ...lastMessage };
          newLastMessage.data.text.push(messageData.text);
          this.messageList[this.messageList.length - 1] = newLastMessage;
          return;
        }
        messageData.text = [messageData.text];
        break;
      }
      case MessageType.CHAT_DELETE:
        this.socket.close();
        this.setChatStatus(ChatStatus.ENDED);
        break;
      default:
        log.error('Unsupported message type', messageType);
        return;
    }
    this.messageList.push(payload);
  };

  reconnect = () => {
    this.setChatStatus(ChatStatus.NOT_STARTED);
    this.setName('');
    // @ts-ignore
    this.messageList.clear();
    this.socket.close();
    this.socket = new Socket(this);
  };

  closeChatWindow = () => {
    this.socket.close();
    this.socket = null;
  };

  setChatStatus = (status) => {
    this.chatStatus = status;
  };
}

export default ChatWindowStore;
