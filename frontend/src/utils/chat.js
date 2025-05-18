import { matchPath } from 'react-router-dom';

// eslint-disable-next-line import/prefer-default-export
export const getChatRouteInfo = (path) => {
  const ongoingChatMatch = matchPath({ path: `/chat/:roomType/:roomId` }, pathname);
  const randomChatMatch = matchPath({ path: `/chat/match` }, pathname);
  if (ongoingChatMatch) {
    const { roomType, roomId } = ongoingChatMatch.params;
    return { type: 'room', roomType, roomId };
  }
  if (randomChatMatch) {
    return { type: 'match' };
  }
  return { type: 'none' };
};
