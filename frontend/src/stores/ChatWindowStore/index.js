import { makeAutoObservable } from 'mobx';
import { ChatStatus, MatchTimeout, MessageType } from 'appConstants';
import log from 'loglevel';
import profileStore from 'stores/ProfileStore';
import { fetchUrl, isEmptyObj } from 'utils';
import Socket from './socket';

class ChatWindowStore {
  avatarUrl = '';

  name = '';

  messageList = [];

  chatStatus = ChatStatus.NOT_STARTED;

  initDone = false;

  constructor(data) {
    makeAutoObservable(this);
    data && this.initState(data);
    this.chatStartedPromise = new Promise((resolve, reject) => {
      this.chatStartedResolve = resolve;
    });
    if (this.isGroupChat) {
      this.initializeForGroup();
    } else {
      this.setInitDone(true);
    }
    this.socket = new Socket(this);
  }

  initializeForGroup = () => {
    const groupDetail = fetchUrl(`/api/chat/groups/${this.roomId}/?password=${this.password}`);
    const groupMessages = groupDetail.then((response) => response.data.group_messages);
    groupMessages.then((messages) => {
      let detailMessages;
      if (!messages) {
        detailMessages = [
          {
            type: MessageType.CHAT_DELETE,
            data: {
              text: 'Group is deleted',
            },
          },
        ];
        this.addInitMessageList(detailMessages);
        this.setInitDone(true);
        this.setChatStatus(ChatStatus.ENDED);
        this.socket.close();
      } else {
        detailMessages = messages.map((msg) => {
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
      }
      const messagesToAdd = detailMessages.filter((msg) => {
        const processedMessage = this.processMessage(msg, true);
        return !isEmptyObj(processedMessage);
      });
      this.chatStartedPromise.then(() => {
        this.addInitMessageList(messagesToAdd);
        this.setInitDone(true);
      });
    });
  };

  initState = ({ roomId, name, password }) => {
    this.roomId = roomId;
    this.name = name;
    this.password = password || '';
  };

  setName = (newName) => {
    this.name = newName;
  };

  setAvatarUrl = (url) => {
    this.avatarUrl = url;
  };

  setInitDone = (initDone) => {
    this.initDone = initDone;
  };

  get isGroupChat() {
    return !!this.roomId;
  }

  processMessage = (payload, isInitMsg) => {
    const messageType = payload.type;
    const messageData = payload.data;
    switch (messageType) {
      case MessageType.USER_INFO:
        profileStore.setId(messageData.id);
        if (!this.isGroupChat) {
          clearTimeout(this.timeout);
          this.timeout = setTimeout(
            (chatWindowStore) => {
              if (chatWindowStore.chatStatus === ChatStatus.NOT_STARTED) {
                chatWindowStore.socket.close();
                chatWindowStore.setChatStatus(ChatStatus.NO_MATCH_FOUND);
              }
            },
            MatchTimeout,
            this
          );
        }
        this.setChatStatus(ChatStatus.NOT_STARTED);
        return {};
      case MessageType.USER_JOINED:
        if ('match' in messageData) {
          clearTimeout(this.timeout);
          this.setName(messageData.match.name);
          this.setAvatarUrl(messageData.match.avatarUrl);
        }
        messageData.text = this.isGroupChat
          ? [`${messageData.newJoinee.name} entered`]
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
        const lastMessageIdx = isInitMsg ? 0 : this.messageList.length - 1;
        const lastMessage = this.messageList.length && this.messageList[lastMessageIdx];
        if (
          lastMessage &&
          lastMessage.type === MessageType.TEXT &&
          lastMessage.data.sender.id === messageData.sender.id
        ) {
          const newLastMessage = { ...lastMessage };
          isInitMsg
            ? newLastMessage.data.text.unshift(messageData.text)
            : newLastMessage.data.text.push(messageData.text);
          this.messageList[lastMessageIdx] = newLastMessage;
          return {};
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
        return {};
    }
    return payload;
  };

  addMessage = (payload, isInitMsg) =>
    isInitMsg ? this.messageList.unshift(payload) : this.messageList.push(payload);

  addInitMessageList = (messageList) => {
    this.messageList = messageList.concat(this.messageList);
  };

  reconnect = () => {
    this.setChatStatus(ChatStatus.RECONNECT_REQUESTED);
    this.setName('');
    this.setAvatarUrl('');
    // @ts-ignore
    this.messageList.clear();
    this.socket.close();
    this.socket = new Socket(this);
  };

  closeChatWindow = () => {
    this.setChatStatus(ChatStatus.ENDED);
    this.socket.close();
    this.socket = null;
  };

  setChatStatus = (status) => {
    this.chatStatus = status;
  };
}

export default ChatWindowStore;
