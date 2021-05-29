import React, { useEffect } from 'react';
import { Box, CssBaseline, makeStyles } from '@material-ui/core';
import { NavBar, Home, Footer, ChatContainer } from 'components';
import UserInfoDialog from 'components/UserInfoDialog';
import Alert from 'components/Alert';
import LoginSignupDialog from 'components/LoginSignupDialog';
import { fetchUrl } from 'utils';
import { profileStore } from 'stores';
import PullToRefresh from 'pulltorefreshjs';

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
}));

const App = () => {
  const classes = useStyles();

  useEffect(() => {
    const csrfPromise = fetchUrl('/api/csrf/');
    csrfPromise.then(() => {
      fetchUrl('/api/login/').then((response) => {
        if (response.data && response.data.username) {
          profileStore.setUsername(response.data.username);
        }
      });
    });
    PullToRefresh.init({
      mainElement: 'body',
      onRefresh() {
        window.location.reload();
      },
    });
    return () => PullToRefresh.destroyAll();
  }, []);

  return (
    <CssBaseline>
      <Box className={classes.root}>
        <Alert />
        <NavBar />
        <Home />
        <Footer />
        <ChatContainer />
        <UserInfoDialog />
        <LoginSignupDialog />
      </Box>
    </CssBaseline>
  );
};

export default App;
