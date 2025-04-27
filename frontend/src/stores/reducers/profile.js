import { ProfileActions } from 'stores/actions';

export const initialProfileState = {
  name: '',
  avatarUrl: '',
  sessionId: '',
  email: '',
  profileInitialized: false,
  social: false,
};

export const profileReducer = (state, action) => {
  switch (action.type) {
    case ProfileActions.SET_NAME:
      return { ...state, name: action.payload.name };
    case ProfileActions.SET_AVATAR_URL:
      return { ...state, avatarUrl: action.payload.avatarUrl };
    case ProfileActions.SET_SESSION_ID:
      return { ...state, sessionId: action.payload.sessionId };
    case ProfileActions.SET_EMAIL:
      return { ...state, email: action.payload.email };
    case ProfileActions.SET_PROFILE_INITIALIZED:
      return { ...state, profileInitialized: true };
    case ProfileActions.SET_SOCIAL:
      return { ...state, social: action.payload.social };
    case ProfileActions.LOGIN:
      return { ...state, email: action.payload.email, social: action.payload.social };
    case ProfileActions.LOGOUT:
      return { ...state, email: '', social: false };
    default:
      return state;
  }
};
