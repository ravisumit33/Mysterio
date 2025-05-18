import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getChatRouteInfo } from 'utils';
import { getRoomProtectionService } from 'services';
import { getStoredChatWindowData } from 'utils/browserStorageUtils';
import { ChatInitializationStatus, GlobalDialogTypes, RoomType } from 'appConstants';
import { useGlobalDialogStore } from '../useStore';
import useTaskRunnerWithAlert from '../useTaskRunnerWithAlert';

const useInitalizeChatData = () => {
  const { pathname } = useLocation();
  // @ts-ignore
  const { openGlobalDialog } = useGlobalDialogStore();
  const runTaskWithAlert = useTaskRunnerWithAlert();
  const [status, setStatus] = useState(ChatInitializationStatus.LOADING);
  const [chatData, setChatData] = useState(null);

  useEffect(() => {
    const { type, roomType, roomId } = getChatRouteInfo(pathname);

    if (type === 'match') {
      setChatData({});
      setStatus(ChatInitializationStatus.READY);
      return;
    }

    if (type === 'room' && roomType && roomId && Object.values(RoomType).includes(roomType)) {
      const storedData = getStoredChatWindowData(roomType, roomId);
      const hydratedChatData = { ...storedData, roomId, roomType };
      const isGroupRoom = roomType === RoomType.GROUP;

      const proceed = (finalData) => {
        setChatData(finalData);
        setStatus(ChatInitializationStatus.READY);
      };

      if (!isGroupRoom || hydratedChatData.password) {
        proceed(hydratedChatData);
      } else {
        runTaskWithAlert({
          task: () => getRoomProtectionService(),
          onSuccessCb: ({ data }) => {
            const { is_protected: isProtected, name, avatar_url: avatarUrl } = data;
            hydratedChatData.name = name;
            hydratedChatData.avatarUrl = avatarUrl;
            if (!isProtected) {
              proceed(hydratedChatData);
            } else {
              openGlobalDialog(GlobalDialogTypes.ROOM_PASSWORD, {
                chatData: hydratedChatData,
                onSuccess: (pwd) => {
                  proceed({ ...hydratedChatData, password: pwd });
                },
                onCancel: () => setStatus(ChatInitializationStatus.FAILED),
              });
            }
          },
          onErrorCb: (err, showAlert) => {
            showAlert({
              text: 'Error occurred while connecting to server.',
              severity: 'error',
            });
            setStatus(ChatInitializationStatus.FAILED);
          },
        });
      }
    } else {
      setStatus(ChatInitializationStatus.FAILED);
    }
  }, [pathname, openGlobalDialog, runTaskWithAlert]);

  return { status, chatData };
};

export default useInitalizeChatData;
