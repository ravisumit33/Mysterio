import { MessageType, RoomType, ChatStatus, MatchTimeout } from 'appConstants';
import SocketManager from './socket';
import BaseManager from './base';

class ChatManager extends BaseManager {
  constructor(getCtx) {
    super(getCtx);
    this.socket = null;
    this.socket = new SocketManager(this, this.getCtx);
  }

  processMessage = (payload, isInitMsg) => {
    const messageType = payload.type;
    const messageData = payload.data;
    const { roomType, chatStatus } = this.stores.chatRoomStore;
    const { setChatStatus } = this.actions;
    switch (messageType) {
      case MessageType.USER_INFO:
        if (roomType === RoomType.INDIVIDUAL) {
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
            setChatStatus(ChatStatus.NOT_STARTED);
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
           */
          if (roomType === RoomType.GROUP) {
            messageData.content = `${messageData.newJoinee.name} entered`;
          } else if ('match' in messageData) {
            clearTimeout(this.matchTimeout);
            this.setName(messageData.match.name);
            this.setAvatarUrl(messageData.match.avatarUrl);
            updateStoredChatWindowData(RoomType.INDIVIDUAL, messageData.room_id, {
              name: messageData.match.name,
              avatarUrl: messageData.match.avatarUrl,
            });
            this.setRoomInfo({ ...this.roomInfo, roomId: messageData.room_id });
            messageData.content = `You are matched to ${messageData.match.name}`;
          } else if (messageData.is_room_inactive) {
            messageData.content = 'Reconnecting...';
            // @ts-ignore
            newChatStatus = ChatStatus.RECONNECTING;
          } else {
            messageData.content = 'Connection restored';
          }
        } else if (this.chatStatus === ChatStatus.RECONNECTING) {
          messageData.content = 'Connection restored';
        } else if (this.chatStatus === ChatStatus.ONGOING && this.isGroupChat) {
          messageData.content = `${messageData.newJoinee.name} entered`;
        }
        if (!isInitMsg) {
          this.setChatStatus(newChatStatus);
          this.setInitDone(true);
        }
        break;
      }
      case MessageType.USER_LEFT:
        if (this.isGroupChat) {
          messageData.content = `${messageData.resignee.name} left`;
        } else {
          this.setChatStatus(ChatStatus.RECONNECTING);
          messageData.content = 'Reconnecting...';
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
        if (this.isGroupChat || this.chatStatus === ChatStatus.NOT_STARTED) {
          messageData.content = 'Room no longer exists';
        } else {
          messageData.content = `${this.name} left`;
        }
        this.closeChatSession();
        break;
      case MessageType.RECONNECTING:
        messageData.content = 'Reconnecting...';
        this.setChatStatus(ChatStatus.RECONNECTING);
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
}

export default ChatManager;
