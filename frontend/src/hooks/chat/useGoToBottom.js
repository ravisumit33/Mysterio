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

  useEffect(() => {
    let cleanup;
    if (!atBottom) {
      showButtonTimeoutRef.current = setTimeout(() => setShowButton(true), 500);
      cleanup = () => clearTimeout(showButtonTimeoutRef.current);
    } else {
      setShowButton(false);
      setUnreadMessagesCount(0);
    }
    return cleanup;
  }, [atBottom]);

  return {
    unreadMessagesCount,
    showBottomButton: showButton,
    setAtBottom,
  };
};

export default useGoToBottom;
