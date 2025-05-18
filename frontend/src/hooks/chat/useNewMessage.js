import { useEffect, useState } from 'react';
import { MessageType, MessageSenderType } from 'appConstants';
import { useProfileStore } from '../useStore';

const useNewMessage = ({ initDone, lastMessage }) => {
  // @ts-ignore
  const { profileStore } = useProfileStore();

  const [initialRenderingDone, setInitialRenderingDone] = useState(false);
  const [lastRenderedNewMessage, setLastRenderedNewMessage] = useState(null);

  useEffect(() => {
    if (initDone) {
      setInitialRenderingDone(true);
    }
  }, [initDone]);

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
