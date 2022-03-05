import { useEffect, useState } from 'react';
import { MessageType, MessageSenderType } from 'appConstants';
import { profileStore } from 'stores';

const useNewMessage = ({ initialRenderingDone, lastMessage }) => {
  const [lastRenderedNewMessage, setLastRenderedNewMessage] = useState(null);
  const hasNewMessage =
    initialRenderingDone &&
    lastMessage &&
    lastMessage.type === MessageType.TEXT &&
    lastMessage !== lastRenderedNewMessage;
  let newMessageInfo;
  if (hasNewMessage) {
    const {
      data: { sender },
    } = lastMessage;
    newMessageInfo = {
      senderType:
        sender.session_id === profileStore.sessionId
          ? MessageSenderType.SELF
          : MessageSenderType.OTHER,
    };
  }
  useEffect(() => {
    if (initialRenderingDone && hasNewMessage) {
      setLastRenderedNewMessage(lastMessage);
    }
  }, [hasNewMessage, initialRenderingDone, lastMessage]);

  return { hasNewMessage, newMessageInfo };
};

export default useNewMessage;
