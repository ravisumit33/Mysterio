import { BrowserStorageKeys } from 'appConstants';
import { updateStoredChatWindowData } from 'utils/browserStorageUtils';
import useLocalStorage from './useLocalStorage';

const useStoredChatWindowData = (roomType, roomId) => {
  const [storedChatWindowData] = useLocalStorage(BrowserStorageKeys.chatWindowData, {});
  const { [roomType]: roomData } = storedChatWindowData;
  const { [roomId]: chatWindowData } = roomData || {};
  const storeChatWindowData = (newChatWindowData) => {
    updateStoredChatWindowData(roomType, roomId, newChatWindowData);
  };
  return [chatWindowData, storeChatWindowData];
};

export default useStoredChatWindowData;
