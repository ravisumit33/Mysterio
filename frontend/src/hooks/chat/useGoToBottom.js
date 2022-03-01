import { useEffect, useRef, useState } from 'react';

const useGoToBottom = ({ hasNewMessage }) => {
  const [atBottom, setAtBottom] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const showButtonTimeoutRef = useRef(null);

  useEffect(() => {
    if (showButton) {
      hasNewMessage && setUnreadMessagesCount((oldUnreadMessageCount) => oldUnreadMessageCount + 1);
    } else {
      setUnreadMessagesCount(0);
    }
  }, [hasNewMessage, showButton]);

  useEffect(() => () => clearTimeout(showButtonTimeoutRef.current));
  useEffect(() => {
    clearTimeout(showButtonTimeoutRef.current);
    if (!atBottom) {
      showButtonTimeoutRef.current = setTimeout(() => setShowButton(true), 500);
    } else {
      setShowButton(false);
      setUnreadMessagesCount(0);
    }
  }, [atBottom]);

  return {
    unreadMessagesCount,
    showBottomButton: showButton,
    setAtBottom,
  };
};

export default useGoToBottom;
