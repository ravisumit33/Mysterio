import { useContext } from 'react';
import {
  AlertContext,
  ProfileContext,
  UserContext,
  GlobalDialogContext,
  WaitScreenContext,
} from 'contexts';

export const useAlertStore = () => useContext(AlertContext);
export const useProfileStore = () => useContext(ProfileContext);
export const useUserStore = () => useContext(UserContext);
export const useGlobalDialogStore = () => useContext(GlobalDialogContext);
export const useWaitScreenStore = () => useContext(WaitScreenContext);
