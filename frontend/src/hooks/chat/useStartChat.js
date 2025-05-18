import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

const useStartChat = () => {
  const history = useHistory();
  const startChat = useCallback(
    (chatParams = {}) => {
      const { roomType, roomId } = chatParams;
      const basePath = roomType && roomId ? `/chat/${roomType}/${roomId}/` : `/chat/match/`;
      const url = `${basePath}?chatSession=${Date.now()}`;
      history.push(url);
    },
    [history],
  );
  return startChat;
};

export default useStartChat;
