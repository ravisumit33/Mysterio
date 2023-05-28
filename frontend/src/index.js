import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { configure } from 'mobx';
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

configure({ isolateGlobalState: true });

let theme = createTheme();
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
