import { MysterioOrigin } from 'appConstants';
import axios from 'axios';
import { getCookie, isCordovaEnv, isDevEnv } from './utils';

const getCompleteUrl = (url) => {
  let completeUrl;
  try {
    completeUrl = new URL(url);
    completeUrl.protocol = isCordovaEnv() ? 'https' : window.location.protocol;
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

const axiosInstance = axios.create({
  headers: {
    'X-CSRFToken': getCookie('csrftoken'),
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const resp = error.response;
    if (resp.status === 401 && resp.statusText === 'Unauthorized') {
      return axios({
        method: 'post',
        url: getCompleteUrl('/api/account/token/refresh/'),
        data: {},
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
