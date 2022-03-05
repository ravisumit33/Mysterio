import React, { useEffect } from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
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
  NewRoom,
} from 'components';
import { fetchUrl, isCordovaEnv } from 'utils';
import { profileStore } from 'stores';

const useStyles = makeStyles(() => ({
  // @ts-ignore
  root: ({ pathname }) => ({
    width: '100%',
    minHeight: '100%',
    position: 'relative',
    ...(/\/chat.*/.test(pathname) && {
      position: 'fixed',
      inset: 0,
    }),
  }),
}));

let theme = createTheme();
theme = responsiveFontSizes(theme);

function App() {
  const { pathname } = useLocation();
  const classes = useStyles({ pathname });

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
    return () => {
      if (isCordovaEnv()) {
        window.localStorage.removeItem('token');
      }
    };
  }, []);

  return (
    <CssBaseline>
      <ThemeProvider theme={theme}>
        <Grid container direction="column" className={classes.root}>
          <Alert />
          <AppWait />
          <Grid item>
            <NavBar />
          </Grid>
          <Switch>
            <Route exact path="/">
              <UserInfoDialog />
              <Grid item>
                <Home />
              </Grid>
              <Grid item>
                <Footer />
              </Grid>
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
            <Route path="/room">
              <Grid item>
                <NewRoom />
              </Grid>
            </Route>
          </Switch>
        </Grid>
      </ThemeProvider>
    </CssBaseline>
  );
}

export default App;
