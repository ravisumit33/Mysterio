import React, { useEffect } from 'react';
import {
  Box,
  CssBaseline,
  makeStyles,
  createMuiTheme,
  ThemeProvider,
  responsiveFontSizes,
} from '@material-ui/core';
import { NavBar, Home, Footer, ChatContainer } from 'components';
import UserInfoDialog from 'components/UserInfoDialog';
import Alert from 'components/Alert';
import LoginSignupDialog from 'components/LoginSignupDialog';
import { fetchUrl, isCordovaEnv } from 'utils';
import { profileStore } from 'stores';
import PullToRefresh from 'pulltorefreshjs';

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
}));

let theme = createMuiTheme();
theme = responsiveFontSizes(theme);

const App = () => {
  const classes = useStyles();

  useEffect(() => {
    const csrfPromise = fetchUrl('/api/csrf/');
    csrfPromise.then((resp) => {
      if (isCordovaEnv()) {
        window.localStorage.setItem('token', resp.data.token);
      }
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
    return () => {
      if (isCordovaEnv()) {
        window.localStorage.removeItem('token');
      }
      PullToRefresh.destroyAll();
    };
  }, []);

  return (
    <CssBaseline>
      <ThemeProvider theme={theme}>
        <Box className={classes.root}>
          <Alert />
          <NavBar />
          <Home />
          <Footer />
          <ChatContainer />
          <UserInfoDialog />
          <LoginSignupDialog />
        </Box>
      </ThemeProvider>
    </CssBaseline>
  );
};

export default App;
