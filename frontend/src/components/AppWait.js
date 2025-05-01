import React from 'react';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@mui/styles';
import { useHydration, useWaitScreenStore } from 'hooks';
import WaitScreen from './WaitScreen';

const useStyles = makeStyles(() => ({
  waitScreen: {
    position: 'absolute',
    zIndex: 1,
    height: '100vh',
  },
}));

function AppWait() {
  const classes = useStyles();
  // @ts-ignore
  const { isAppReady } = useHydration();
  // @ts-ignore
  const { waitScreenStore } = useWaitScreenStore();
  return (
    <WaitScreen
      shouldOpen={!isAppReady || waitScreenStore.shouldShow}
      waitScreenText={waitScreenStore.text}
      className={classes.waitScreen}
    />
  );
}

export default observer(AppWait);
