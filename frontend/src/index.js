import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { configure } from 'mobx';
import 'index.css';
import App from 'app';
import { isCordovaEnv } from 'utils';
import * as serviceWorker from './serviceWorker';

configure({ isolateGlobalState: true });

const renderReactDom = () => {
  ReactDOM.render(
    <Router>
      <App />
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
