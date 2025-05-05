import React, { useMemo, useEffect, useReducer, useCallback } from 'react';
import PropTypes from 'prop-types';
import { UserContext } from 'contexts';
import { userReducer, initialUserState, UserActions } from 'stores';
import {
  getUserService,
  loginService,
  socialLoginService,
  logoutService,
  registerService,
  passwordChangeService,
  deleteAccountService,
  verifyEmailService,
  forgotPasswordService,
  resetPasswordService,
} from 'services';
import { useHydration } from 'hooks';
import { HydrationKeys } from 'appConstants';

export default function UserProvider({ children }) {
  const [userStore, userDispatch] = useReducer(userReducer, initialUserState);
  // @ts-ignore
  const { trackHydration, markHydrated, isHydrated } = useHydration();

  useEffect(() => trackHydration(HydrationKeys.USER), [trackHydration]);

  useEffect(() => {
    if (!isHydrated(HydrationKeys.USER)) {
      getUserService()
        .then((response) => {
          const responseData = response.data;
          // @ts-ignore
          const { email, is_socially_registered: social } = responseData;
          // @ts-ignore
          userDispatch({ type: UserActions.HYDRATED, payload: { email, social } });
        })
        .catch(() =>
          // @ts-ignore
          userDispatch({ type: UserActions.HYDRATED, payload: { email: '', social: false } })
        )
        .finally(() => {
          markHydrated(HydrationKeys.USER);
        });
    }
  }, [isHydrated, markHydrated]);

  const login = useCallback(
    (credentials) =>
      loginService(credentials).then((response) => {
        // @ts-ignore
        userDispatch({
          type: UserActions.LOGIN_SUCCEEDED,
          // @ts-ignore
          payload: { email: response.data.user.email, social: false },
        });
        return response;
      }),
    []
  );

  const logout = useCallback(
    () =>
      logoutService().then((response) => {
        // @ts-ignore
        userDispatch({ type: UserActions.LOGGED_OUT });
        return response;
      }),
    []
  );

  const register = useCallback((credentials) => registerService(credentials), []);

  const socialLogin = useCallback(
    (provider, credentials) =>
      socialLoginService(provider, credentials).then((response) => {
        // @ts-ignore
        const { email } = response.data.user;
        // @ts-ignore
        userDispatch({ type: UserActions.LOGIN_SUCCEEDED, payload: { email, social: true } });
        return response;
      }),
    []
  );

  const changePassword = useCallback((oldPwd, newPwd) => passwordChangeService(oldPwd, newPwd), []);

  const forgotPassword = useCallback((email) => forgotPasswordService(email), []);

  const resetPassword = useCallback(
    (userId, key, newPassword) => resetPasswordService(userId, key, newPassword),
    []
  );

  const deleteAccount = useCallback(() => deleteAccountService(), []);

  const verifyEmail = useCallback((key) => verifyEmailService(key), []);

  const value = useMemo(
    () => ({
      userStore,
      login,
      socialLogin,
      logout,
      register,
      changePassword,
      forgotPassword,
      resetPassword,
      deleteAccount,
      verifyEmail,
    }),
    [
      userStore,
      login,
      logout,
      register,
      socialLogin,
      changePassword,
      forgotPassword,
      resetPassword,
      deleteAccount,
      verifyEmail,
    ]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
