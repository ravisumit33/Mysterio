import React, { useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import { AlertContext } from 'contexts';
import { AlertActions, alertReducer, initialAlertState } from 'stores';

export default function AlertProvider({ children }) {
  const [alertStore, alertDispatch] = useReducer(alertReducer, initialAlertState);
  const value = useMemo(() => {
    const hideAlert = () => alertDispatch({ type: AlertActions.HIDE });
    const showAlert = (alert) => {
      const dispatchAlert = (payload) => alertDispatch({ type: AlertActions.SHOW, payload });
      if (alertStore.visible) {
        hideAlert();
        setTimeout(() => dispatchAlert(alert), 300);
      } else {
        dispatchAlert(alert);
      }
    };
    return { alertState: alertStore, showAlert, hideAlert };
  }, [alertStore, alertDispatch]);
  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

AlertProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
