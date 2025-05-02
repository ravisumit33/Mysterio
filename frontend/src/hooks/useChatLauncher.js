import { GlobalDialogTypes } from 'appConstants';
import { useHistory } from 'react-router-dom';
import { useGlobalDialogStore, useProfileStore } from './useStore';

const useChatLauncher = () => {
  const history = useHistory();
  // @ts-ignore
  const { profileStore } = useProfileStore();
  // @ts-ignore
  const { openGlobalDialog } = useGlobalDialogStore();

  const launchChat = () => {
    if (!profileStore.isReady) {
      openGlobalDialog(GlobalDialogTypes.USER_INFO, {
        checkComplete: () => profileStore.isReady,
        onComplete: launchChat,
      });
    } else {
      history.push('/chat/match/');
    }
  };

  return launchChat;
};

export default useChatLauncher;
