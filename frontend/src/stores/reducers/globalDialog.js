import { GlobalDialogActions } from 'stores/actions';

export const initialGlobalDialogState = {
  type: undefined,
  isOpen: false,
  payload: null,
};

export const globalDialogReducer = (state, action) => {
  switch (action.type) {
    case GlobalDialogActions.OPEN:
      return { ...state, type: action.payload.type, isOpen: true, payload: action.payload.payload };
    case GlobalDialogActions.CLOSE:
      return { ...state, type: undefined, isOpen: false, payload: null };
    default:
      return state;
  }
};
