import React from 'react';
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
  GlobalDialog,
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
import { isDevEnv } from 'utils';

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

  // TODO: Add an alert for internet connection down
  return (
    <Sentry.ErrorBoundary fallback={<ErrorUI />}>
      <CssBaseline>
        <Stack className={classes.root}>
          <Alert />
          {!/\/chat.*/.test(pathname) && <NavBar />}
          <GlobalDialog />
          <ScrollToTop />
          <Switch>
            <Route exact path="/">
              <Home />
              <Footer />
            </Route>
            <Route path="/login">
              <Auth key="login" />
            </Route>
            <Route path="/register">
              <Auth key="register" shouldRegister />
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
                    <ChatContainer key={location.key} type="match" />
                  </Box>
                );
              }}
            />
            <Route
              path="/chat/:roomType/:roomId"
              render={({ match }) => {
                console.log('chat room key: ', `${match.params.roomType}-${match.params.roomId}`);
                return (
                  <Box sx={{ flexGrow: 1, flexBasis: 0 }}>
                    <ChatContainer
                      key={`${match.params.roomType}-${match.params.roomId}`}
                      type="room"
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
            <AppWait />
          </Switch>
        </Stack>
      </CssBaseline>
    </Sentry.ErrorBoundary>
  );
}

export default App;
