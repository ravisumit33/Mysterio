import { useContext } from 'react';
import {
  AccountDrawerContext,
  AlertContext,
  ProfileContext,
  UserInfoDialogContext,
  WaitScreenContext,
} from './contexts';

export const useAlertStore = () => useContext(AlertContext);
export const useProfileStore = () => useContext(ProfileContext);
export const useUserInfoDialogStore = () => useContext(UserInfoDialogContext);
export const useAccountDrawerStore = () => useContext(AccountDrawerContext);
export const useWaitScreenStore = () => useContext(WaitScreenContext);
