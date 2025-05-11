import { useContext } from 'react';
import {
  AlertContext,
  ProfileContext,
  UserContext,
  GlobalDialogContext,
  WaitScreenContext,
  ChatRoomInfoContext,
  ChatRoomDataContext,
  ChatMessageContext,
  ChatPlayerContext,
} from 'contexts';

export const useAlertStore = () => useContext(AlertContext);
export const useProfileStore = () => useContext(ProfileContext);
export const useUserStore = () => useContext(UserContext);
export const useGlobalDialogStore = () => useContext(GlobalDialogContext);
export const useWaitScreenStore = () => useContext(WaitScreenContext);
export const useChatRoomInfoStore = () => useContext(ChatRoomInfoContext);
export const useChatRoomDataStore = () => useContext(ChatRoomDataContext);
export const useChatMessageStore = () => useContext(ChatMessageContext);
export const useChatPlayerStore = () => useContext(ChatPlayerContext);
