import React, { useCallback, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import { AlertContext } from 'contexts';
import { AlertActions, alertReducer, initialAlertState } from 'stores';

export default function AlertProvider({ children }) {
  const [alertStore, alertDispatch] = useReducer(alertReducer, initialAlertState);

  /*
   * If alert with given id is present in alertQueue, it is removed.
   * If alert with given id is not in alertQueue, there are two cases:
   * 1. It has already been show and hidden: No problem at all,
   * 2. It is currently being shown: alertStore state will change which will re-render AppAlert, effectively hiding the alert
   */
  const hideAlert = useCallback(
    // @ts-ignore
    (id) => alertDispatch({ type: AlertActions.REMOVE, payload: { id } }),
    []
  );

  const showAlert = useCallback((alert) => {
    const id = crypto.randomUUID();
    // @ts-ignore
    alertDispatch({ type: AlertActions.ADD, payload: { ...alert, id } });
    return id;
  }, []);

  const popAlert = useCallback(() => {
    const { alertQueue } = alertStore;
    if (alertQueue.length === 0) {
      return null;
    }
    const currentAlert = { ...alertQueue[0] };
    // @ts-ignore
    alertDispatch({ type: AlertActions.REMOVE, payload: { id: currentAlert.id } });
    return currentAlert;
  }, [alertStore]);

  const value = useMemo(
    () => ({ alertStore, showAlert, hideAlert, popAlert }),
    [alertStore, showAlert, hideAlert, popAlert]
  );

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

AlertProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
