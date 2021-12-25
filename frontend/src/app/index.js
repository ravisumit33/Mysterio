import React, { useEffect } from 'react';
import PullToRefresh from 'pulltorefreshjs';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import {
  CssBaseline,
  makeStyles,
  createTheme,
  ThemeProvider,
  responsiveFontSizes,
  Grid,
} from '@material-ui/core';
import {
  NavBar,
  Home,
  Footer,
  ChatContainer,
  UserInfoDialog,
  Alert,
  Auth,
  Account,
  AppWait,
} from 'components';
import { fetchUrl, isCordovaEnv } from 'utils';
import { profileStore } from 'stores';

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    minHeight: '100vh',
    position: 'relative',
  },
}));

let theme = createTheme();
theme = responsiveFontSizes(theme);

const App = () => {
  const classes = useStyles();

  useEffect(() => {
    fetchUrl('/api/account/user/')
      .then((response) => {
        const responseData = response.data;
        if (responseData) {
          // @ts-ignore
          const { email } = responseData;
          // @ts-ignore
          const isSociallyRegistered = responseData.is_socially_registered;
          email && profileStore.setEmail(email);
          isSociallyRegistered && profileStore.setSocial(isSociallyRegistered);
        }
      })
      .catch(() => {})
      .finally(() => profileStore.setProfileInitialized(true));
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
        <AppWait />
        <Grid container direction="column" className={classes.root}>
          <Router>
            <Alert />
            <Grid item>
              <NavBar />
            </Grid>
            <Switch>
              <Route exact path="/">
                <Grid item>
                  <Home />
                </Grid>
                <Grid item>
                  <Footer />
                </Grid>
                <UserInfoDialog />
              </Route>
              <Route path="/login">
                <Grid item xs>
                  <Auth />
                </Grid>
              </Route>
              <Route path="/register">
                <Grid item xs>
                  <Auth shouldRegister />
                </Grid>
              </Route>
              <Route path="/account">
                <Grid item>
                  <Account />
                </Grid>
              </Route>
              <Route path="/chat">
                <Grid item container xs>
                  <ChatContainer />
                </Grid>
              </Route>
            </Switch>
          </Router>
        </Grid>
      </ThemeProvider>
    </CssBaseline>
  );
};

export default App;
