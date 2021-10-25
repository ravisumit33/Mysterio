import { makeAutoObservable } from 'mobx';
import { ChatStatus, MatchTimeout, MessageType } from 'appConstants';
import log from 'loglevel';
import { fetchUrl, isEmptyObj } from 'utils';
import profileStore from '../ProfileStore';
import Socket from './socket';

class ChatWindowStore {
  avatarUrl = '';

  name = '';

  messageList = [];

  chatStatus = ChatStatus.NOT_STARTED;

  initDone = false;

  shouldShowIframe = false;

  shouldHideIframe = false;

  playerPromise = {};

  constructor({ appStore, data }) {
    const plPromise = new Promise((resolve, reject) => {
      this.playerPromise.resolve = resolve;
      this.playerPromise.reject = reject;
    });
    this.playerPromise = { promise: plPromise, ...this.playerPromise };
    makeAutoObservable(this);
    this.appStore = appStore;
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
              text: 'Room is deleted',
            },
          },
        ];
        this.addInitMessageList(detailMessages);
        this.setInitDone(true);
        this.closeChatWindow();
      } else {
        detailMessages = messages.map((msg) => {
          const message = {
            data: {},
          };
          message.data.text = msg.text;
          message.type = msg.message_type;
          const sessionData = msg.sender_channel.session;
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
      this.prevMessageList = [];
      detailMessages.forEach((msg) => {
        const processedMessage = this.processMessage(msg, true);
        if (!isEmptyObj(processedMessage)) {
          this.prevMessageList.push(processedMessage);
        }
      });
      this.chatStartedPromise.then(() => {
        this.addInitMessageList(this.prevMessageList);
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

  setShouldShowIframe = (shouldShowIframe) => {
    this.shouldShowIframe = shouldShowIframe;
  };

  setShouldHideIframe = (shouldHideIframe) => {
    this.shouldHideIframe = shouldHideIframe;
  };

  setPlayer = (player) => {
    this.player = player;
  };

  get isGroupChat() {
    return !!this.roomId;
  }

  processMessage = (payload, isInitMsg) => {
    const messageType = payload.type;
    const messageData = payload.data;
    switch (messageType) {
      case MessageType.USER_INFO:
        profileStore.setSessionId(messageData.session_id);
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
        const msgList = isInitMsg ? this.prevMessageList : this.messageList;
        const lastMessageIdx = msgList.length - 1;
        const lastMessage = lastMessageIdx >= 0 && msgList[lastMessageIdx];
        if (
          lastMessage &&
          lastMessage.type === MessageType.TEXT &&
          lastMessage.data.sender.session_id === messageData.sender.session_id
        ) {
          const newLastMessage = { ...lastMessage };
          isInitMsg
            ? newLastMessage.data.text.unshift(messageData.text)
            : newLastMessage.data.text.push(messageData.text);
          msgList[lastMessageIdx] = newLastMessage;
          return {};
        }
        messageData.text = [messageData.text];
        break;
      }
      case MessageType.CHAT_DELETE:
        this.closeChatWindow();
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
    this.setShouldShowIframe(false);
    this.setChatStatus(ChatStatus.ENDED);
    this.socket.close();
  };

  setChatStatus = (status) => {
    this.chatStatus = status;
  };
}

export default ChatWindowStore;
