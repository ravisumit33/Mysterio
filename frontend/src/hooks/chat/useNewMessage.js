import { useEffect, useState } from 'react';
import { MessageType } from 'appConstants';

const useNewMessage = ({ initialRenderingDone, lastMessage }) => {
  const [lastRenderedNewMessage, setLastRenderedNewMessage] = useState(null);
  const hasNewMessage =
    initialRenderingDone &&
    lastMessage &&
    lastMessage.type === MessageType.TEXT &&
    lastMessage !== lastRenderedNewMessage;
  useEffect(() => {
    if (initialRenderingDone && hasNewMessage) {
      setLastRenderedNewMessage(lastMessage);
    }
  }, [hasNewMessage, initialRenderingDone, lastMessage]);

  return { hasNewMessage };
};

export default useNewMessage;
