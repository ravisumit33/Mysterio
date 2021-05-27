import React, { useEffect } from 'react';
import { Box, CssBaseline, makeStyles } from '@material-ui/core';
import { NavBar, Home, Footer, ChatContainer } from 'components';
import UserInfoDialog from 'components/UserInfoDialog';
import Alert from 'components/Alert';
import LoginSignupDialog from 'components/LoginSignupDialog';
import { fetchUrl, isEmptyObj } from 'utils';
import { profileStore } from 'stores';

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
    const csrfPromise = fetchUrl('api/csrf/', {
      headers: {
        secretkey: process.env.REACT_APP_SECRET_KEY,
      },
    });
    csrfPromise.then(() => {
      fetchUrl('api/login/').then((data) => {
        if (!isEmptyObj(data)) {
          profileStore.setUsername(data.username);
        }
      });
    });
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
