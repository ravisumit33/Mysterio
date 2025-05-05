import { UserActions } from '../actions';

export const initialUserState = {
  email: '',
  social: false,
};

export const userReducer = (state, action) => {
  switch (action.type) {
    case UserActions.LOGIN_SUCCEEDED:
      return { ...state, email: action.payload.email, social: action.payload.social };
    case UserActions.LOGGED_OUT:
      return { ...state, email: '', social: false };
    case UserActions.HYDRATED:
      return {
        ...state,
        email: action.payload.email,
        social: action.payload.social,
      };
    default:
      return state;
  }
};
