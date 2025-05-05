import { GlobalDialogContext } from 'contexts';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useReducer } from 'react';
import { GlobalDialogActions, globalDialogReducer, initialGlobalDialogState } from 'stores';

export default function GlobalDialogProvider({ children }) {
  const [globalDialogStore, globalDialogDispatch] = useReducer(
    globalDialogReducer,
    initialGlobalDialogState
  );

  const openGlobalDialog = useCallback((type, payload) => {
    // @ts-ignore
    globalDialogDispatch({ type: GlobalDialogActions.OPENED, payload: { type, payload } });
  }, []);

  const closeGlobalDialog = useCallback(() => {
    // @ts-ignore
    globalDialogDispatch({ type: GlobalDialogActions.CLOSED });
  }, []);

  const value = useMemo(
    () => ({ globalDialogStore, openGlobalDialog, closeGlobalDialog }),
    [globalDialogStore, openGlobalDialog, closeGlobalDialog]
  );

  return <GlobalDialogContext.Provider value={value}>{children}</GlobalDialogContext.Provider>;
}

GlobalDialogProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
