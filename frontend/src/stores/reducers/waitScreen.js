import { WaitScreenActions } from '../actions';

export const initialWaitScreenState = {
  shoulShow: false,
  text: '',
};

export const waitScreenReducer = (state, action) => {
  switch (action.type) {
    case WaitScreenActions.STARTED:
      return {
        ...state,
        shouldShow: true,
        text: action.payload.text,
      };
    case WaitScreenActions.ENDED:
      return {
        ...state,
        shouldShow: false,
        text: '',
      };
    default:
      return state;
  }
};
