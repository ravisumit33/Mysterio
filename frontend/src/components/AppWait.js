import React from 'react';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@mui/styles';
import { appStore } from 'stores';
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
  return (
    <WaitScreen
      shouldOpen={appStore.shouldShowWaitScreen}
      waitScreenText={appStore.waitScreenText}
      className={classes.waitScreen}
    />
  );
}

export default observer(AppWait);
