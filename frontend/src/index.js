import React from 'react';
import ReactDOM from 'react-dom';
import { configure } from 'mobx';
import 'index.css';
import App from 'app';
import * as serviceWorker from './serviceWorker';

configure({ isolateGlobalState: true });

const renderReactDom = () => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  );
};

// @ts-ignore
if (window.cordova) {
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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
