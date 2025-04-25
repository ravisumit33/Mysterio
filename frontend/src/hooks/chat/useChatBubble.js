import { useState, useEffect } from 'react';

const useChatBubble = ({ chatMinimized, hasNewMessage }) => {
  const [newMessageCount, setNewMessageCount] = useState(0);
  useEffect(() => {
    if (!chatMinimized) {
      setNewMessageCount(0);
    } else if (hasNewMessage) {
      setNewMessageCount((oldMsgCnt) => oldMsgCnt + 1);
    }
  }, [chatMinimized, hasNewMessage]);

  return newMessageCount;
};

export default useChatBubble;
