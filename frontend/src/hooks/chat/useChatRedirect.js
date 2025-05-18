import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useChatRoomInfoStore } from '../useStore';

const useChatRedirect = () => {
  // @ts-ignore
  const { chatRoomInfoStore } = useChatRoomInfoStore();
  const { roomType, roomId, initDone } = chatRoomInfoStore;

  const location = useLocation();
  const history = useHistory();
  const ongoingChatUrl = `/chat/${roomType}/${roomId}/`;
  const shouldRedirect = initDone && location.pathname !== ongoingChatUrl;
  useEffect(() => {
    if (shouldRedirect) {
      history.replace({
        pathname: ongoingChatUrl,
        search: location.search,
        hash: location.hash,
      });
    }
  }, [shouldRedirect, history, ongoingChatUrl, location.search, location.hash]);
};

export default useChatRedirect;
