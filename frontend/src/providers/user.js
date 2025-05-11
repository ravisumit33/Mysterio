import React, { useMemo, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { UserContext } from 'contexts';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHydration } from 'hooks';
import { HydrationKeys } from 'appConstants';

export default function UserProvider({ children }) {
  const queryClient = useQueryClient();
  // @ts-ignore
  const { trackHydration, markHydrated } = useHydration();

  useEffect(() => trackHydration(HydrationKeys.USER), [trackHydration]);

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const response = await getUserService();
        // @ts-ignore
        const { email, is_socially_registered: social } = response.data;
        return { email, social };
      } catch (error) {
        return { email: '', social: false };
      }
    },
    initialData: { email: '', social: false },
    onSettled: (data, error, querClient) => {
      markHydrated(HydrationKeys.USER);
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginService,
    onSuccess: (response) => {
      queryClient.setQueryData(['user'], {
        // @ts-ignore
        email: response.data.user.email,
        social: false,
      });
    },
  });

  const socialLoginMutation = useMutation({
    mutationFn: socialLoginService,
    onSuccess: (response) => {
      queryClient.setQueryData(['user'], {
        // @ts-ignore
        email: response.data.user.email,
        social: true,
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutService,
    onSuccess: () => {
      queryClient.setQueryData(['user'], { email: '', social: false });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccountService,
    onSuccess: () => {
      queryClient.setQueryData(['user'], { email: '', social: false });
    },
  });

  const register = useCallback((credentials) => registerService(credentials), []);
  const verifyEmail = useCallback((key) => verifyEmailService(key), []);
  const forgotPassword = useCallback((email) => forgotPasswordService(email), []);
  const changePassword = useCallback((oldPwd, newPwd) => passwordChangeService(oldPwd, newPwd), []);
  const resetPassword = useCallback(
    (userId, key, newPassword) => resetPasswordService(userId, key, newPassword),
    [],
  );

  const value = useMemo(
    () => ({
      userData,
      login: loginMutation.mutate,
      socialLogin: socialLoginMutation.mutate,
      logout: logoutMutation.mutate,
      register,
      changePassword,
      forgotPassword,
      resetPassword,
      deleteAccount: deleteAccountMutation.mutate,
      verifyEmail,
    }),
    [
      userData,
      loginMutation.mutate,
      socialLoginMutation.mutate,
      logoutMutation.mutate,
      register,
      changePassword,
      forgotPassword,
      resetPassword,
      deleteAccountMutation.mutate,
      verifyEmail,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
