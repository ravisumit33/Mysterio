import { AlertActions } from '../actions';

export const initialAlertState = {
  alertQueue: [],
};

export const alertReducer = (state, action) => {
  switch (action.type) {
    case AlertActions.ADDED:
      return {
        ...state,
        alertQueue: [...state.alertQueue, action.payload],
      };
    case AlertActions.REMOVED:
      return {
        ...state,
        alertQueue: state.alertQueue.filter((alert) => alert.id !== action.payload.id),
      };
    default:
      return state;
  }
};
