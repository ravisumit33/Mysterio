import React, { useEffect } from 'react';
import log from 'loglevel';
import * as Sentry from '@sentry/react';
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
  ErrorUI,
  PrivacyPolicy,
  TermsOfService,
  CookiePolicy,
  ScrollToTop,
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
    height: '100%',
    position: 'relative',
  },
}));

function App() {
  const { pathname } = useLocation();
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
    return () => {
      if (isCordovaEnv()) {
        window.localStorage.removeItem('token');
      }
    };
  }, []);

  return (
    <Sentry.ErrorBoundary fallback={<ErrorUI />}>
      <CssBaseline>
        <Stack className={classes.root}>
          <Alert />
          <AppWait />
          {!/\/chat.*/.test(pathname) && <NavBar />}
          <UserInfoDialog />
          <ScrollToTop />
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
            <Route
              exact
              path="/chat/match"
              render={({ location }) => {
                console.log('chat match key: ', location.key);
                return (
                  <Box sx={{ flexGrow: 1, flexBasis: 0 }}>
                    <ChatContainer key={location.key} type="match" location={location} />
                  </Box>
                );
              }}
            />
            <Route
              path="/chat/:roomType/:roomId"
              render={({ match, location }) => {
                console.log('chat room key: ', `${match.params.roomType}-${match.params.roomId}`);
                return (
                  <Box sx={{ flexGrow: 1, flexBasis: 0 }}>
                    <ChatContainer
                      key={`${match.params.roomType}-${match.params.roomId}`}
                      type="room"
                      location={location}
                    />
                  </Box>
                );
              }}
            />
            <Route path="/room">
              <NewRoom />
            </Route>
            <Route path="/privacy">
              <PrivacyPolicy />
            </Route>
            <Route path="/terms">
              <TermsOfService />
            </Route>
            <Route path="/cookies">
              <CookiePolicy />
            </Route>
          </Switch>
        </Stack>
      </CssBaseline>
    </Sentry.ErrorBoundary>
  );
}

export default App;
