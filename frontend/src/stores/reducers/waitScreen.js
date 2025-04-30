import { WaitScreenActions } from '../actions';

export const initialWaitScreenState = {
  visible: false,
  text: '',
};

export const waitScreenReducer = (state, action) => {
  switch (action.type) {
    case WaitScreenActions.SHOW:
      return {
        ...state,
        visible: true,
        text: action.payload.text,
      };
    case WaitScreenActions.HIDE:
      return {
        ...state,
        visible: false,
        text: '',
      };
    default:
      return state;
  }
};
