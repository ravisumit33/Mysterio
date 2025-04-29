import { fetchUrl } from 'utils';

export const login = (credentials) =>
  fetchUrl('/api/account/login/', {
    method: 'post',
    body: credentials,
  });

export const socialLogin = (provider, credentials) =>
  fetchUrl(`/api/account/${provider}/login/`, {
    method: 'post',
    body: credentials,
  });

export const logout = () =>
  fetchUrl('/api/account/logout/', {
    method: 'post',
  });

export const register = (credentials) =>
  fetchUrl('/api/accout/registration/', { method: 'post', body: credentials });

export const getUser = () => fetchUrl('/api/account/user/');
