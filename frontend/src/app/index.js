import React, { useEffect } from 'react';
import log from 'loglevel';
import { Switch, Route, useLocation } from 'react-router-dom';
import { Box, CssBaseline, Stack } from '@mui/material';
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
import { fetchUrl, isCordovaEnv, isDevEnv } from 'utils';
import { profileStore } from 'stores';

if (isDevEnv()) {
  log.setDefaultLevel('trace');
}

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    minHeight: '100%',
    position: 'relative',
  },
}));

function App() {
  const { pathname } = useLocation();
  const classes = useStyles();

  useEffect(() => {
    let cleanup = () => {};
    const rootElement = document.querySelector('#root');
    let metaViewportContent =
      'initial-scale=1, width=device-width, minimum-scale=1, maximum-scale=1';
    if (/\/chat.*/.test(pathname)) {
      metaViewportContent = `${metaViewportContent}, interactive-widget=resizes-content`;
      const getRootHeight = () =>
        Math.min(
          window.innerHeight,
          document.documentElement.clientHeight,
          Math.round(window.visualViewport.height)
        );
      // @ts-ignore
      rootElement.style.height = `${getRootHeight()}px`;
      const handleViewPortResize = () => {
        // @ts-ignore
        rootElement.style.height = `${getRootHeight()}px`;
      };
      window.addEventListener('resize', handleViewPortResize);
      cleanup = () => {
        window.removeEventListener('resize', handleViewPortResize);
      };
    } else {
      // @ts-ignore
      rootElement.style.height = '';
    }
    document.querySelector('meta[name="viewport"]').setAttribute('content', metaViewportContent);
    return cleanup;
  }, [pathname]);

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
      <Stack className={classes.root}>
        <Alert />
        <AppWait />
        <NavBar />
        <UserInfoDialog />
        <Switch>
          <Route exact path="/">
            <Home />
            <Footer />
          </Route>
          <Route path="/login">
            <Auth />
          </Route>
          <Route path="/register">
            <Auth shouldRegister />
          </Route>
          <Route path="/account">
            <Account />
          </Route>
          <Route path="/chat">
            <Box sx={{ flexGrow: 1, flexBasis: 0 }}>
              <ChatContainer />
            </Box>
          </Route>
          <Route path="/room">
            <NewRoom />
          </Route>
        </Switch>
      </Stack>
    </CssBaseline>
  );
}

export default App;
