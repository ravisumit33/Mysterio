import React, { useCallback, useMemo, useReducer } from 'react';
import { WaitScreenContext } from 'contexts';
import PropTypes from 'prop-types';
import { initialWaitScreenState, waitScreenReducer, WaitScreenActions } from 'stores';

export default function WaitScreenProvider({ children }) {
  const [waitScreenStore, waitScreenDispatch] = useReducer(
    waitScreenReducer,
    initialWaitScreenState
  );

  const hideWaitScreen = useCallback(
    // @ts-ignore
    () => waitScreenDispatch({ type: WaitScreenActions.ENDED }),
    []
  );

  const showWaitScreen = useCallback(
    // @ts-ignore
    (text) => waitScreenDispatch({ type: WaitScreenActions.STARTED, text }),
    []
  );

  const value = useMemo(
    () => ({ waitScreenStore, hideWaitScreen, showWaitScreen }),
    [waitScreenStore, hideWaitScreen, showWaitScreen]
  );

  return <WaitScreenContext.Provider value={value}>{children}</WaitScreenContext.Provider>;
}

WaitScreenProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
