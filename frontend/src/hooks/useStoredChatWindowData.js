import { getStoredChatWindowData, updateStoredChatWindowData } from 'utils/browserStorageUtils';

const useStoredChatWindowData = (roomType, roomId) => {
  /**
   * Format of storedChatWindowData:
   * {
   *  [roomType]: {
   *     [roomId]: {
   *       name: string,
   *       avatarUrl: string,
   *       password: string,
   *     },
   *     ...
   *   },
   *   ...
   * }
   */
  const storeChatWindowData = (newChatWindowData) => {
    updateStoredChatWindowData(roomType, roomId, newChatWindowData);
  };
  return [getStoredChatWindowData(roomType, roomId), storeChatWindowData];
};

export default useStoredChatWindowData;
