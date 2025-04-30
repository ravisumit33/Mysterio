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

export const verifyEmail = (key) =>
  fetchUrl('/api/account/registration/verify-email/', {
    method: 'post',
    body: { key },
  });

export const passwordChange = (oldPwd, newPwd) =>
  fetchUrl('/api/account/password/change/', {
    method: 'post',
    body: {
      old_password: oldPwd,
      new_password1: newPwd,
      new_password2: newPwd,
    },
  });

export const deleteAccount = () =>
  fetchUrl('/api/account/delete/', {
    method: 'post',
    body: {},
  });
