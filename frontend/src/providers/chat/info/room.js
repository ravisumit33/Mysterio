import React, { useCallback, useReducer, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ChatRoomInfoActions, chatRoomInfoReducer, initialChatRoomInfoState } from 'stores';
import { ChatRoomInfoContext } from 'contexts';
import { updateStoredChatWindowData } from 'utils/browserStorageUtils';
import { useChatHydration } from 'hooks';
import withStorage from '../../withStorage';

const chatRoomInfoReducerWithStorage = withStorage(chatRoomInfoReducer, (chatRoomInfoStore) => {
  const { roomType, roomId } = chatRoomInfoStore;
  updateStoredChatWindowData(roomType, roomId, { roomInfo: chatRoomInfoStore });
});

export default function ChatRoomInfoProvider({ children }) {
  // @ts-ignore
  const { roomInfo: hydratedRoomInfo } = useChatHydration();

  const [chatRoomInfoStore, chatRoomInfoDispatch] = useReducer(
    chatRoomInfoReducerWithStorage,
    hydratedRoomInfo,
    (hydratedState) => ({
      ...initialChatRoomInfoState,
      ...hydratedState,
    }),
  );

  const updateChatRoomData = useCallback(
    (roomData) =>
      // @ts-ignore
      chatRoomInfoDispatch({ type: ChatRoomInfoActions.ROOM_DATA_UPDATED, payload: roomData }),
    [],
  );

  const updateBasicInfo = useCallback(
    (basicInfo) =>
      // @ts-ignore
      chatRoomInfoDispatch({ type: ChatRoomInfoActions.BASIC_INFO_UPDATED, payload: basicInfo }),
    [],
  );

  const value = useMemo(
    () => ({
      chatRoomInfoStore,
      updateChatRoomData,
      updateBasicInfo,
    }),
    [chatRoomInfoStore, updateChatRoomData, updateBasicInfo],
  );

  return <ChatRoomInfoContext.Provider value={value}>{children}</ChatRoomInfoContext.Provider>;
}

ChatRoomInfoProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
