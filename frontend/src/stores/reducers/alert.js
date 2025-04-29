import { AlertActions } from '../actions';

export const initialAlertState = {
  visible: false,
  text: '',
  severity: '',
  action: '',
};

export const alertReducer = (state, action) => {
  switch (action.type) {
    case AlertActions.SHOW:
      return {
        ...state,
        visible: true,
        text: action.payload.text,
        severity: action.payload.severity,
        action: action.payload.action,
      };
    case AlertActions.HIDE:
      return { ...state, visible: false, text: '', severity: '', action: '' };
    default:
      return state;
  }
};
