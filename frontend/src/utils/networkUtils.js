import { MysterioOrigin } from 'appConstants';
import axios from 'axios';
import { getCookie, isCordovaEnv, isDevEnv } from './utils';

const getCompleteUrl = (url) => {
  let completeUrl;
  try {
    completeUrl = new URL(url);
    completeUrl.protocol = isCordovaEnv() ? 'https' : window.location.protocol;
    if (isDevEnv()) {
      // make origin same as current origin
      completeUrl.hostname = window.location.hostname;
      completeUrl.port = window.location.port;
    }
    completeUrl = completeUrl.href;
  } catch (_) {
    // url is relative
    let origin = '';
    if (!isDevEnv()) {
      origin = isCordovaEnv() ? MysterioOrigin : window.origin;
    }
    completeUrl = origin + url;
  }
  return completeUrl;
};

const commonHeaders = {
  'X-CSRFToken': getCookie('csrftoken'),
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const axiosInstance = axios.create({
  headers: commonHeaders,
});
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const resp = error.response;
    const tokenRefreshUrl = getCompleteUrl('/api/account/token/refresh/');
    if (originalRequest.url !== tokenRefreshUrl && (resp.status === 401 || resp.status === 403)) {
      return axios({
        method: 'post',
        url: tokenRefreshUrl,
        data: {},
        headers: commonHeaders,
      }).then(() => axios(originalRequest));
    }
    return Promise.reject(error);
  }
);

const fetchUrl = (url, data) =>
  axiosInstance({
    method: (data && data.method) || 'get',
    url: getCompleteUrl(url),
    headers: (data && data.headers) || {},
    data: (data && data.body) || {},
  }).catch((error) => {
    throw error.response;
  });

export default fetchUrl;
