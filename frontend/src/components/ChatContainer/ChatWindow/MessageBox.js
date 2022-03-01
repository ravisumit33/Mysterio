import React, { useContext, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { ChatWindowStoreContext } from 'contexts';
import { Virtuoso } from 'react-virtuoso';
import { Badge, Grid, IconButton, makeStyles, Tooltip } from '@material-ui/core';
import { ChatStatus } from 'appConstants';
import { useGoToBottom } from 'hooks';

const useStyles = makeStyles((theme) => ({
  // @ts-ignore
  messageBox: ({ chatStatus }) => ({
    ...((chatStatus === ChatStatus.ENDED || chatStatus === ChatStatus.NO_MATCH_FOUND) && {
      opacity: 0.5,
    }),
  }),
  bottomButton: {
    fontWeight: 'bold',
    fontSize: '2rem',
    color: theme.palette.common.black,
  },
}));
function MessageBox(props) {
  const { firstItemIndex, hasNewMessage, chatMessages } = props;

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

  return (
    <Grid item xs className={classes.messageBox}>
      <Virtuoso
        totalCount={totalMessageCount}
        itemContent={(index, chatMessage) => chatMessage}
        initialTopMostItemIndex={totalMessageCount ? totalMessageCount - 1 : 0}
        data={chatMessages}
        startReached={handleChatWindowTopReached}
        firstItemIndex={firstItemIdx}
        followOutput="auto"
        atBottomStateChange={setAtBottom}
        ref={messageListRef}
      />
      {showBottomButton && (
        <IconButton
          onClick={() => {
            messageListRef.current.scrollToIndex({
              index: chatMessages.length - 1,
              align: 'end',
            });
          }}
          style={{ float: 'right', transform: 'translate(-0.25rem, -3.5rem)' }}
        >
          <Tooltip title="Go to bottom" arrow>
            <Badge color="secondary" badgeContent={unreadMessagesCount}>
              <span className={clsx('material-icons', classes.bottomButton)}>
                keyboard_double_arrow_down
              </span>
            </Badge>
          </Tooltip>
        </IconButton>
      )}
    </Grid>
  );
}

MessageBox.propTypes = {
  firstItemIndex: PropTypes.number.isRequired,
  hasNewMessage: PropTypes.bool,
  chatMessages: PropTypes.arrayOf(PropTypes.element),
};

MessageBox.defaultProps = {
  hasNewMessage: false,
  chatMessages: [],
};

export default MessageBox;
