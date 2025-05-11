import React, { useContext, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ChatWindowStoreContext } from 'contexts';
import { Virtuoso } from 'react-virtuoso';
import { Box, Typography } from '@mui/material';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { ChatStatus, MessageSenderType, MessageType } from 'appConstants';
import { useGoToBottom, useProfileStore } from 'hooks';
import ChatMessage from './ChatMessage';
import BottomButton from './BottomButton';

const useStyles = makeStyles((theme) => ({
  // @ts-ignore
  messageBox: ({ chatStatus }) => ({
    ...([ChatStatus.ENDED, ChatStatus.NO_MATCH_FOUND, ChatStatus.RECONNECTING].includes(
      chatStatus,
    ) && {
      opacity: 0.3,
    }),
    width: '100%',
    height: '100%',
  }),
  section: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  infoMsg: {
    padding: theme.spacing(1, 1),
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.spacing(1.5),
  },
  infoMsgBox: {
    textAlign: 'center',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));
function MessageBox(props) {
  const { firstItemIndex, newMessageInfo, messageList, hasNewMessage } = props;
  // @ts-ignore
  const { profileStore } = useProfileStore();

  const [firstItemIdx, setFirstItemIdx] = useState(firstItemIndex);
  const messageListRef = useRef(null);
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const { loadPreviousMessages, chatStatus } = chatWindowStore;
  const classes = useStyles({ chatStatus });
  const { unreadMessagesCount, showBottomButton, setAtBottom } = useGoToBottom({ hasNewMessage });

  const handleChatWindowTopReached = () => {
    loadPreviousMessages().then((msgCnt) =>
      setFirstItemIdx((oldFirstItemIndex) => oldFirstItemIndex - msgCnt),
    );
  };
  const totalMessageCount = messageList.length;

  const renderMessage = (message, idx, list) => {
    const messageData = message.data;
    if (message.type === MessageType.TEXT) {
      const previousMessageData = idx ? list[idx - 1].data : null;
      const nextMessageData = idx + 1 === list.length ? null : list[idx + 1].data;
      const { sender } = messageData;
      const previousSender = previousMessageData && previousMessageData.sender;
      const nextSender = nextMessageData && nextMessageData.sender;
      let side;
      let isFirst;
      let isLast;
      if (!sender) {
        side = 'left';
        isFirst = true;
        isLast = false;
      } else {
        side = sender.session_id === profileStore.sessionId ? 'right' : 'left';
        isFirst = !previousSender || sender.session_id !== previousSender.session_id;
        isLast = !isFirst && (!nextSender || sender.session_id !== nextSender.session_id);
      }
      return (
        // eslint-disable-next-line react/no-array-index-key
        <Box key={idx} className={classes.section}>
          <ChatMessage
            side={side}
            message={messageData.content}
            sender={messageData.sender}
            first={isFirst}
            last={isLast}
          />
        </Box>
      );
    }
    return (
      // eslint-disable-next-line react/no-array-index-key
      <Box key={idx} className={clsx(classes.section, classes.infoMsgBox)}>
        <Typography
          align="center"
          variant="caption"
          color="textSecondary"
          className={classes.infoMsg}
        >
          {messageData.content}
        </Typography>
      </Box>
    );
  };

  const bottomButton = useMemo(
    () => (
      <BottomButton
        scrollToBottom={() => {
          messageListRef.current.scrollToIndex({
            index: messageList.length - 1,
            align: 'end',
          });
        }}
        unreadMessagesCount={unreadMessagesCount}
      />
    ),
    [messageList.length, unreadMessagesCount],
  );

  return (
    <Box className={classes.messageBox}>
      <Virtuoso
        totalCount={totalMessageCount}
        itemContent={(index, msg, ctx) => renderMessage(index, msg, ctx.messageList)}
        initialTopMostItemIndex={totalMessageCount ? totalMessageCount - 1 : 0}
        data={messageList}
        startReached={handleChatWindowTopReached}
        firstItemIndex={firstItemIdx}
        followOutput={(isAtBottom) =>
          isAtBottom || (newMessageInfo && newMessageInfo.senderType === MessageSenderType.SELF)
        }
        atBottomStateChange={setAtBottom}
        ref={messageListRef}
        context={{ messageList }}
      />
      {showBottomButton && bottomButton}
    </Box>
  );
}

MessageBox.propTypes = {
  firstItemIndex: PropTypes.number.isRequired,
  newMessageInfo: PropTypes.shape({
    senderType: PropTypes.oneOf(Object.values(MessageSenderType)),
  }),
  messageList: PropTypes.arrayOf(PropTypes.shape({})),
  hasNewMessage: PropTypes.bool,
};

MessageBox.defaultProps = {
  newMessageInfo: undefined,
  messageList: [],
  hasNewMessage: false,
};

export default MessageBox;
