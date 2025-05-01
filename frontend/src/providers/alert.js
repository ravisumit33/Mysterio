import React, { useCallback, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import { AlertContext } from 'contexts';
import { AlertActions, alertReducer, initialAlertState } from 'stores';

export default function AlertProvider({ children }) {
  const [alertStore, alertDispatch] = useReducer(alertReducer, initialAlertState);

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

  const value = useMemo(
    () => ({ alertStore, showAlert, hideAlert }),
    [alertStore, showAlert, hideAlert]
  );

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

AlertProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
