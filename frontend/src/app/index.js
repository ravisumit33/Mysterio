import React, { useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
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
import Auth from 'components/Auth';
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
    fetchUrl('/api/login/').then((response) => {
      if (response.data && response.data.username) {
        profileStore.setUsername(response.data.username);
      }
    });
    fetchUrl('/api/csrf/').then((resp) => {
      if (isCordovaEnv()) {
        window.localStorage.setItem('token', resp.data.token);
      }
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
          <Router>
            <Alert />
            <NavBar />
            <Switch>
              <Route exact path="/">
                <Home />
                <Footer />
                <ChatContainer />
                <UserInfoDialog />
              </Route>
              <Route path="/login">
                <Auth />
              </Route>
              <Route path="/register">
                <Auth shouldRegister />
              </Route>
            </Switch>
          </Router>
        </Box>
      </ThemeProvider>
    </CssBaseline>
  );
};

export default App;
