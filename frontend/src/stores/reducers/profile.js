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
    case ProfileActions.SET_PROFILE_INITIALIZED:
      return { ...state, profileInitialized: true };
    case ProfileActions.LOGIN:
      return { ...state, email: action.payload.email, social: action.payload.social };
    case ProfileActions.LOGOUT:
      return { ...state, email: '', social: false };
    default:
      return state;
  }
};
