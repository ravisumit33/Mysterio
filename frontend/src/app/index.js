import React from 'react';
import log from 'loglevel';
import * as Sentry from '@sentry/react';
import { Switch, Route, useLocation } from 'react-router-dom';
import { Box, CssBaseline, Stack, Button } from '@mui/material';
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
  CenterPaper,
  Notification,
  RouterLink,
} from 'components';
import { isDevEnv } from 'utils';
import { useSearchParams } from 'hooks';
import notFoundJson from 'assets/animations/not-found.json';

if (isDevEnv()) {
  log.setDefaultLevel('trace');
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    minHeight: '100%',
    height: '100%',
    position: 'relative',
  },
  chatSessionNotFound: {
    marginBottom: theme.spacing(2),
  },
}));

function ChatRouteWrapper() {
  const [searchParams] = useSearchParams();
  // @ts-ignore
  const chatSession = searchParams.get('chatSession');
  const classes = useStyles();

  if (!chatSession) {
    return (
      <Box width="100%">
        <CenterPaper>
          <Stack justifyContent="space-around" spacing={2}>
            <Notification
              animationProps={{
                containerId: 'noChatSession',
                containerClassName: classes.chatSessionNotFound,
                animationData: notFoundJson,
                width: 40,
                height: 40,
              }}
              title="No active chat session!!"
              description="Probably your chat session ended. Go to home to start a new chat."
            />
            <RouterLink to="/" tabIndex={-1} style={{ alignSelf: 'center' }}>
              <Button color="secondary" variant="contained" size="large">
                Home
              </Button>
            </RouterLink>
          </Stack>
        </CenterPaper>
      </Box>
    );
  }
  return <ChatContainer key={chatSession} />;
}

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
            <Route path="/chat">
              <Box sx={{ flexGrow: 1, flexBasis: 0 }}>
                <ChatRouteWrapper />
              </Box>
            </Route>
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
