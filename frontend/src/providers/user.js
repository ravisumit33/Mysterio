import React, { useMemo, useEffect, useReducer, useCallback } from 'react';
import PropTypes from 'prop-types';
import { UserContext } from 'contexts';
import { userReducer, initialUserState, UserActions } from 'stores';
import {
  getUser,
  login as loginService,
  socialLogin as socialLoginService,
  logout as logoutService,
  register as registerService,
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
      getUser()
        .then((response) => {
          const responseData = response.data;
          // @ts-ignore
          const { email, is_socially_registered: social } = responseData;
          // @ts-ignore
          userDispatch({ type: UserActions.HYDRATE, payload: { email, social } });
        })
        .catch(() =>
          // @ts-ignore
          userDispatch({ type: UserActions.HYDRATE, payload: { email: '', social: false } })
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
          type: UserActions.LOGIN,
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
        userDispatch({ type: UserActions.LOGOUT });
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
        userDispatch({ type: UserActions.LOGIN, payload: { email, social: true } });
        return response;
      }),
    []
  );

  const value = useMemo(
    () => ({
      userStore,
      login,
      socialLogin,
      logout,
      register,
    }),
    [userStore, login, logout, register, socialLogin]
  );
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
