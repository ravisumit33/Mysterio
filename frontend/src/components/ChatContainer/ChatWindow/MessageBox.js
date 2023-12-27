import React, { useContext, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ChatWindowStoreContext } from 'contexts';
import { Virtuoso } from 'react-virtuoso';
import { alpha, Badge, Box, IconButton, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ChatStatus, MessageSenderType } from 'appConstants';
import { useGoToBottom } from 'hooks';
import { KeyboardDoubleArrowDown } from '@mui/icons-material';

const useStyles = makeStyles((theme) => ({
  // @ts-ignore
  messageBox: ({ chatStatus }) => ({
    ...([ChatStatus.ENDED, ChatStatus.NO_MATCH_FOUND, ChatStatus.RECONNECTING].includes(
      chatStatus
    ) && {
      opacity: 0.3,
    }),
    width: '100%',
    height: '100%',
  }),
  bottomButton: {
    color: theme.palette.common.black,
    backgroundColor: alpha(theme.palette.common.white, 0.8),
    borderRadius: '50%',
  },
}));
function MessageBox(props) {
  const { firstItemIndex, hasNewMessage, newMessageInfo, chatMessages } = props;

  const [firstItemIdx, setFirstItemIdx] = useState(firstItemIndex);
  const messageListRef = useRef(null);
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const { loadPreviousMessages, chatStatus } = chatWindowStore;
  const classes = useStyles({ chatStatus });
  const { unreadMessagesCount, showBottomButton, setAtBottom } = useGoToBottom({ hasNewMessage });

  const handleChatWindowTopReached = () => {
    loadPreviousMessages().then((msgCnt) =>
      setFirstItemIdx((oldFirstItemIndex) => oldFirstItemIndex - msgCnt)
    );
  };
  const totalMessageCount = chatMessages.length;

  const bottomButton = useMemo(
    () => (
      <Tooltip title="Go to bottom" arrow>
        <IconButton
          onClick={() => {
            messageListRef.current.scrollToIndex({
              index: chatMessages.length - 1,
              align: 'end',
            });
          }}
          sx={{ float: 'right', transform: 'translate(-0.25rem, -3.5rem)' }}
          size="large"
        >
          <Badge color="secondary" badgeContent={unreadMessagesCount}>
            <span className={classes.bottomButton}>
              <KeyboardDoubleArrowDown fontSize="large" sx={{ verticalAlign: 'middle' }} />
            </span>
          </Badge>
        </IconButton>
      </Tooltip>
    ),
    [chatMessages.length, classes.bottomButton, unreadMessagesCount]
  );

  return (
    <Box className={classes.messageBox}>
      <Virtuoso
        totalCount={totalMessageCount}
        itemContent={(index, chatMessage) => chatMessage}
        initialTopMostItemIndex={totalMessageCount ? totalMessageCount - 1 : 0}
        data={chatMessages}
        startReached={handleChatWindowTopReached}
        firstItemIndex={firstItemIdx}
        followOutput={(isAtBottom) =>
          isAtBottom || (newMessageInfo && newMessageInfo.senderType === MessageSenderType.SELF)
        }
        atBottomStateChange={setAtBottom}
        ref={messageListRef}
      />
      {showBottomButton && bottomButton}
    </Box>
  );
}

MessageBox.propTypes = {
  firstItemIndex: PropTypes.number.isRequired,
  hasNewMessage: PropTypes.bool,
  newMessageInfo: PropTypes.shape({
    senderType: PropTypes.oneOf(Object.values(MessageSenderType)),
  }),
  chatMessages: PropTypes.arrayOf(PropTypes.element),
};

MessageBox.defaultProps = {
  hasNewMessage: false,
  newMessageInfo: undefined,
  chatMessages: [],
};

export default MessageBox;
