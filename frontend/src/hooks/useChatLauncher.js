import { useState, useEffect, useCallback } from 'react';
import { GlobalDialogTypes } from 'appConstants';
import { useGlobalDialogStore, useProfileStore } from './useStore';
import { useStartChat } from './chat';

const useChatLauncher = () => {
  // @ts-ignore
  const { profileStore } = useProfileStore();
  // @ts-ignore
  const { openGlobalDialog } = useGlobalDialogStore();
  const startChat = useStartChat();
  const [pendingLaunch, setPendingLaunch] = useState(null);

  useEffect(() => {
    if (pendingLaunch && profileStore.isReady) {
      startChat(pendingLaunch);
      setPendingLaunch(null);
    }
  }, [pendingLaunch, profileStore.isReady, startChat]);

  const launchChat = (chatParams) => {
    if (!profileStore.isReady) {
      const onSuccessCb = () => setPendingLaunch(chatParams);
      openGlobalDialog(GlobalDialogTypes.USER_INFO, { onSuccess: onSuccessCb });
    } else {
      startChat(chatParams);
    }
  };

  return launchChat;
};

export default useChatLauncher;
