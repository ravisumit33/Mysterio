import { ProfileActions } from '../actions';

export const initialProfileState = {
  name: '',
  avatarUrl: '',
  sessionId: '',
  isReady: false,
};

export const profileReducer = (state, action) => {
  switch (action.type) {
    case ProfileActions.BASIC_INFO_UPDATED:
      return {
        ...state,
        name: action.payload.name,
        avatarUrl: action.payload.avatarUrl,
        sessionId: action.payload.sessionId,
        isReady: true,
      };
    case ProfileActions.HYDRATED: {
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
