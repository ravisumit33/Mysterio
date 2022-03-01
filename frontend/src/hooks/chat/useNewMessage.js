import { useEffect, useState } from 'react';

const useNewMessage = ({ initialRenderingDone, lastMessage }) => {
  const [lastNewRenderedMessage, setLastRenderedMessage] = useState(null);
  const hasNewMessage =
    initialRenderingDone &&
    lastMessage &&
    (lastMessage !== lastNewRenderedMessage ||
      lastMessage.data.content.length !== lastNewRenderedMessage.data.content.length);
  useEffect(() => {
    if (initialRenderingDone && hasNewMessage) {
      setLastRenderedMessage(lastMessage);
    }
  }, [hasNewMessage, initialRenderingDone, lastMessage]);

  return { hasNewMessage };
};

export default useNewMessage;
