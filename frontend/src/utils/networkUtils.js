import { MysterioOrigin } from 'appConstants';
import axios from 'axios';
import { getCookie, isCordovaEnv, isDevEnv } from './utils';

const getCompleteUrl = (url) => {
  let completeUrl;
  try {
    completeUrl = new URL(url);
    completeUrl.protocol = isCordovaEnv() ? 'https' : window.location.protocol;
    if (isDevEnv() && window.origin !== completeUrl.origin) {
      // change origin to window origin to avoid CORS issues
      const newCompleteUrl = new URL(
        `${window.origin}${completeUrl.pathname}${completeUrl.search}${completeUrl.hash}`
      );
      completeUrl = newCompleteUrl;
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
