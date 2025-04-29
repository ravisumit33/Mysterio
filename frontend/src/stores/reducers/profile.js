import { ProfileActions } from '../actions';

export const initialProfileState = {
  name: '',
  avatarUrl: '',
  sessionId: '',
  isReady: false,
};

export const profileReducer = (state, action) => {
  switch (action.type) {
    case ProfileActions.SET_BASIC_INFO:
      return {
        ...state,
        name: action.payload.name,
        avatarUrl: action.payload.avatarUrl,
        sessionId: action.payload.sessionId,
        isReady: true,
      };
    case ProfileActions.HYDRATE: {
      const { name, avatarUrl, sessionId } = action.payload;
      return {
        ...state,
        name,
        avatarUrl,
        sessionId,
        isReady: name && avatarUrl && sessionId,
      };
    }
    default:
      return state;
  }
};
