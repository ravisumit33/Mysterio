import { MysterioOrigin } from 'constants.js';

export const generateRandomColor = (string) => {
  let hash = 0;
  let i;
  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.codePointAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.substr(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
};

export const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i += 1) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === `${name}=`) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

export const isDevEnv = () => process.env.NODE_ENV === 'development';

export const fetchUrl = (url, data) => {
  let completeUrl;
  try {
    completeUrl = new URL(url);
    // @ts-ignore
    completeUrl.protocol = window.cordova ? 'https' : window.location.protocol;
    completeUrl = completeUrl.href;
  } catch (_) {
    // url is relative
    let origin = '';
    if (!isDevEnv()) {
      // @ts-ignore
      origin = window.cordova ? MysterioOrigin : window.origin;
    }
    completeUrl = origin + url;
  }
  return fetch(completeUrl, data).then((response) => response.json());
};
