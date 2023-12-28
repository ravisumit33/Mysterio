import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { configure } from 'mobx';
import * as Sentry from '@sentry/react';
import 'index.css';
import App from 'app';
import { isCordovaEnv } from 'utils';
import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
  StyledEngineProvider,
} from '@mui/material';
import * as serviceWorker from './serviceWorker';

Sentry.init({
  dsn: 'https://bd165b82599a66309dcff63b9139eb26@o4505268225048576.ingest.sentry.io/4506473412362240',
  integrations: [
    new Sentry.BrowserTracing({
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ['localhost', /^https:\/\/mysterio-chat\.com\/api/],
    }),
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

configure({ isolateGlobalState: true });

let theme = createTheme({
  components: {
    MuiUseMediaQuery: {
      defaultProps: {
        noSsr: true,
      },
    },
  },
});
theme = responsiveFontSizes(theme);

const renderReactDom = () => {
  ReactDOM.render(
    <Router>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </StyledEngineProvider>
    </Router>,
    document.getElementById('root')
  );
};

// @ts-ignore
window.loadReactPromise.then(() => {
  if (isCordovaEnv()) {
    document.addEventListener(
      'deviceready',
      () => {
        renderReactDom();
      },
      false
    );
  } else {
    renderReactDom();
  }
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
