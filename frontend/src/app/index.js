import React, { useEffect } from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
import { CssBaseline, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
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
  root: {
    width: '100%',
    minHeight: '100%',
    position: 'relative',
  },
}));

function App() {
  const { pathname } = useLocation();
  const classes = useStyles({ pathname });

  useEffect(() => {
    const rootElement = document.querySelector('#root');
    if (/\/chat.*/.test(pathname)) {
      // @ts-ignore
      rootElement.style.height = `${window.visualViewport.height}px`;
      const handleViewPortResize = () => {
        // @ts-ignore
        rootElement.style.height = `${window.visualViewport.height}px`;
      };
      window.addEventListener('resize', handleViewPortResize);
      return () => window.removeEventListener('resize', handleViewPortResize);
    }
    // @ts-ignore
    rootElement.style.height = '';
    return () => {};
  }, [pathname, classes.root]);

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
    </CssBaseline>
  );
}

export default App;
