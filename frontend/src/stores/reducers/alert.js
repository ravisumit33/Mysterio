import { AlertActions } from '../actions';

export const initialAlertState = {
  alertQueue: [],
};

export const alertReducer = (state, action) => {
  switch (action.type) {
    case AlertActions.ADD:
      return {
        ...state,
        alertQueue: [...state.alertQueue, action.payload],
      };
    case AlertActions.REMOVE:
      return state.filter((alert) => alert.id !== action.payload.id);
    default:
      return state;
  }
};
