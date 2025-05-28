import log from 'loglevel';
import { MessageType, RoomType, ChatStatus, MatchTimeout, ReconnectTimeout } from 'appConstants';
import { isEmptyObj } from 'utils';
import SocketManager from './socket';
import BaseManager from './base';

class ChatManager extends BaseManager {
  constructor(getCtx) {
    super(getCtx);
    this.socket = null;
    this.socket = new SocketManager(this, this.getCtx);
  }

  get isGroupChat() {
    const { roomType } = this.stores.chatRoomInfoStore;
    return roomType === RoomType.GROUP;
  }

  processMessage = (payload, isInitMsg) => {
    const messageType = payload.type;
    const messageData = payload.data;
    const { chatStatus } = this.stores.chatInfoStore;
    const { name } = this.stores.chatRoomInfoStore;
    const { updateChatStatus, markChatRoomInitialized } = this.actions;
    switch (messageType) {
      case MessageType.USER_INFO:
        if (!this.isGroupChat) {
          const { roomId } = messageData;
          if (!roomId) {
            clearTimeout(this.matchTimeout);
            this.matchTimeout = setTimeout(
              (chatManager) => {
                const { chatStatus: cStatus } = chatManager.stores.chatRoomStore;
                const { setChatStatus: setCStatus } = chatManager.actions;
                if (cStatus === ChatStatus.NOT_STARTED) {
                  chatManager.socket.close();
                  setCStatus(ChatStatus.NO_MATCH_FOUND);
                }
              },
              MatchTimeout,
              this,
            );
            updateChatStatus(ChatStatus.NOT_STARTED);
          }
        }
        return {};
      case MessageType.USER_JOINED: {
        let newChatStatus = ChatStatus.ONGOING;
        if (chatStatus === ChatStatus.NOT_STARTED) {
          /*
           * If chat is not started, then it can be because of following reasons:
           * 1. User is joining a group chat
           * 2. User got match in an individual chat
           * 3. User is rejoining an individual chat
           *    a. Match user has still not re-joined
           *    b. Match user has already joined
           */
          if (this.isGroupChat) {
            messageData.content = `${messageData.newJoinee.name} entered`;
          } else if ('match' in messageData) {
            clearTimeout(this.matchTimeout);
            const { updateBasicInfo, updateChatRoomData } = this.actions;
            const { name, avatarUrl, room_id: roomId } = messageData.match;
            updateBasicInfo({ name, avatarUrl });
            updateChatRoomData({ roomId });
            messageData.content = `You are matched to ${messageData.match.name}`;
          } else if (messageData.is_room_inactive) {
            messageData.content = 'Reconnecting...';
            // @ts-ignore
            newChatStatus = ChatStatus.RECONNECTING;
          } else {
            messageData.content = 'Connection restored';
          }
        } else if (chatStatus === ChatStatus.RECONNECTING) {
          messageData.content = 'Connection restored';
        } else if (chatStatus === ChatStatus.ONGOING && this.isGroupChat) {
          messageData.content = `${messageData.newJoinee.name} entered`;
        }
        if (!isInitMsg) {
          updateChatStatus(newChatStatus);
          markChatRoomInitialized();
        }
        break;
      }
      case MessageType.USER_LEFT:
        if (this.isGroupChat) {
          messageData.content = `${messageData.resignee.name} left`;
        } else {
          updateChatStatus(ChatStatus.RECONNECTING);
          messageData.content = 'Reconnecting...';
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = setTimeout(
            (chatManager) => {
              const { chatStatus: cStatus } = chatManager.stores.chatRoomStore;
              if (cStatus === ChatStatus.RECONNECTING) {
                chatManager.closeChatSession();
              }
            },
            ReconnectTimeout,
            this,
          );
        }
        break;
      case MessageType.TEXT: {
        break;
      }
      case MessageType.PLAYER_INFO: {
        messageData.content = `${messageData.host.name} started video player`;
        if (!isInitMsg) {
          this.setPlayerExists(true);
          this.setSyncedPlayerData(messageData);
        }
        break;
      }
      case MessageType.PLAYER_SYNC: {
        !this.isHost && this.setSyncedPlayerData({ ...this.syncedPlayerData, ...messageData });
        return {};
      }
      case MessageType.PLAYER_END: {
        messageData.content = `${messageData.host.name} stopped video player`;
        if (!isInitMsg) {
          this.setPlayerExists(false);
          this.setSyncedPlayerData(null);
        }
        break;
      }
      case MessageType.CHAT_DELETE:
        if (this.isGroupChat || chatStatus === ChatStatus.NOT_STARTED) {
          messageData.content = 'Room no longer exists';
        } else {
          messageData.content = `${name} left`;
        }
        this.closeChatSession();
        break;
      case MessageType.RECONNECTING:
        messageData.content = 'Reconnecting...';
        updateChatStatus(ChatStatus.RECONNECTING);
        break;
      case MessageType.DISCONNECTED:
        messageData.content = 'Disconnected';
        this.closeChatSession();
        break;

      default:
        log.error('Unsupported message type', messageType);
        return {};
    }
    return payload;
  };

  addMessage = (payload) => {
    const processedMessage = this.processMessage(payload);
    !isEmptyObj(processedMessage) && this.actions.addMessage(payload);
  };

  startPlayer = (playerName, videoId) => {
    const playerData = { name: playerName, videoId };
    this.socket?.send(MessageType.PLAYER_INFO, playerData);
  };

  deletePlayer = () => {
    this.socket?.send(MessageType.PLAYER_END);
  };

  handlePlayerDelete = () => {
    if (this.isHost) {
      this.setPlayerExists(false);
      this.deletePlayer();
    }
    this.setSyncedPlayerData(null);
  };

  closeChatSession = () => {
    const { updateChatStatus } = this.actions;
    updateChatStatus(ChatStatus.ENDED);
    if (this.socket) {
      this.handlePlayerDelete();
      this.socket.close();
      this.socket = null;
    }
  };

  sendMessage = (msgType, msgData) => {
    this.socket?.send(msgType, msgData);
  };
}

export default ChatManager;
