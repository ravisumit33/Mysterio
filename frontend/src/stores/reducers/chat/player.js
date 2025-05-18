import { PlayerStatus } from 'appConstants';
import { ChatPlayerActions } from 'stores/actions';

export const initialChatPlayerState = {
  // TODO: This doesn't belong here. Move it to component state.
  // Think about the same for chatMessage and other chat states

  // Only used in chatHeader
  playerExists: false, // player exists on server,
  
  // TODO: Same here.
  // Only used in player
  syncedPlayerData: {
    id: '',
    name: '',
    videoId: '',
    host: {
      sessionId: '',
      name: '',
      avatarUrl: '',
    },
    room: '',
  }, // synced player information if player is opened

  // TODO: Same here.
  // Only used in player
  syncedPlayerState: {
    state: PlayerStatus.UNSTARTED,
    currentTime: 0,
  },
};

export const chatPlayerReducer = (state, action) => {
  switch (action.type) {
    case ChatPlayerActions.PLAYER_ADDED:
      return {
        ...state,
        playerExists: true,
      };
    case ChatPlayerActions.PLAYER_REMOVED:
      return {
        ...state,
        playerExists: false,
      };
    case ChatPlayerActions.PLAYER_SYNCED: {
      const {
        id,
        name,
        video_id: videoId,
        host: { session_id: hostSessionId, name: hostName, avatar_url: hostAvatarUrl },
        room,
        state: playerState,
        current_time: currentTime,
      } = action.payload;
      return {
        ...state,
        sy
        id,
        name,
        videoId,
        host: {
          sessionId: hostSessionId,
          name: hostName,
          avatarUrl: hostAvatarUrl,
        },
        room,
         
      }
    }
    default:
      return state;
  }
};
