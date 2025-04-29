import React, { useMemo, useEffect, useReducer } from 'react';
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
  const { markHydrated, isHydrated } = useHydration();

  useEffect(() => {
    if (!isHydrated(HydrationKeys.USER)) {
      let userData = { email: '', social: false };
      getUser()
        .then((response) => {
          const responseData = response.data;
          // @ts-ignore
          const { email, is_socially_registered: social } = responseData;
          userData = { email, social };
        })
        .catch(() => {})
        .finally(() => {
          // @ts-ignore
          userDispatch({ type: UserActions.HYDRATE, payload: userData });
          markHydrated(HydrationKeys.USER);
        });
    }
  }, [isHydrated, markHydrated]);

  const login = (credentials) =>
    loginService(credentials).then((response) => {
      // @ts-ignore
      userDispatch({
        type: UserActions.LOGIN,
        // @ts-ignore
        payload: { email: response.data.user.email, social: false },
      });
      return response;
    });

  const logout = () =>
    logoutService().then((response) => {
      // @ts-ignore
      userDispatch({ type: UserActions.LOGOUT });
      return response;
    });

  const register = (credentials) => registerService(credentials);

  const socialLogin = (provider, credentials) =>
    socialLoginService(provider, credentials).then((response) => {
      // @ts-ignore
      const { email } = response.data.user;
      // @ts-ignore
      userDispatch({ type: UserActions.LOGIN, payload: { email, social: true } });
      return response;
    });

  const value = useMemo(
    () => ({
      userStore,
      login,
      socialLogin,
      logout,
      register,
    }),
    [userStore]
  );
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
