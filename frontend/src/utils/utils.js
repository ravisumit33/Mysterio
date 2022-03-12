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
  if (isCordovaEnv()) {
    cookieValue = window.localStorage.getItem('token');
  } else if (document.cookie && document.cookie !== '') {
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

// @ts-ignore
export const isCordovaEnv = () => window.cordova;

export const isEmptyObj = (obj) =>
  obj && Object.keys(obj).length === 0 && obj.constructor === Object;

export const getErrorString = (errorResponse) => {
  let errorString = '';
  errorResponse.forEach((err) => {
    errorString += `${err} `;
  });
  return errorString;
};

export const createDeferredPromiseObj = () => {
  let resolve = null;
  let reject = null;
  let status = 'pending';
  const promise = new Promise((res, rej) => {
    resolve = (val) => {
      res(val);
      status = 'resolved';
    };
    reject = (err) => {
      rej(err);
      status = 'rejected';
    };
  });
  return { promise, resolve, reject, status };
};

export const createSyncedMap = () => {
  const map = new Map();
  const setKeyWaitIfUndefined = (key) => {
    if (!map.get(key)) {
      map.set(key, createDeferredPromiseObj());
    }
  };
  return {
    get: async (key) => {
      setKeyWaitIfUndefined(key);
      const val = await map.get(key).promise;
      return val;
    },
    set: (key, val) => {
      setKeyWaitIfUndefined(key);
      map.get(key).resolve(val);
    },
    _map: map,
  };
};
