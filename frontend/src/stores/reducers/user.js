import { UserActions } from '../actions';

export const initialUserState = {
  email: '',
  social: false,
};

export const userReducer = (state, action) => {
  switch (action.type) {
    case UserActions.LOGIN:
      return { ...state, email: action.payload.email, social: action.payload.social };
    case UserActions.LOGOUT:
      return { ...state, email: '', social: false };
    case UserActions.HYDRATE:
      return {
        ...state,
        email: action.payload.email,
        social: action.payload.social,
      };
    default:
      return state;
  }
};
