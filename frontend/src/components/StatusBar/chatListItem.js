import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import CancelIcon from '@material-ui/icons/Cancel';
import Avatar from 'components/Avatar';
import { CircularProgress, IconButton, ListItemIcon } from '@material-ui/core';
import { chatContainerStore } from 'stores';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles(({ palette, spacing }) => ({
  // @ts-ignore
  root: {
    paddingLeft: 8,
    paddingRight: 8,
  },
  rootHover: {
    '&:hover': {
      '& $dot': {
        display: 'none',
      },
      '& $cancel': {
        visibility: 'visible',
      },
    },
  },
  avatar: {
    width: 50,
    height: 50,
    marginRight: 12,
    marginLeft: 12,
  },
  progress: {
    display: 'flex',
    justifyContent: 'center',
    flex: 1,
  },
  // @ts-ignore
  primary: ({ bold }) => ({
    ...(bold && { fontWeight: 'bold' }),
  }),
  // @ts-ignore
  secondary: ({ bold }) => ({
    fontSize: 13,
    color: '#999',
    ...(bold && { fontWeight: 'bold', color: palette.text.primary }),
  }),
  float: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  dot: {
    width: 12,
    height: 12,
    backgroundColor: '#09f',
    borderRadius: '50%',
  },
  cancel: {
    visibility: 'hidden',
  },
  responded: {
    width: 16,
    height: 16,
  },
}));

const ChatListItem = ({ bold, chatId, chatWindowStore }) => {
  const styles = useStyles({ bold });
  const handleClose = (e) => {
    e.stopPropagation();
    chatContainerStore.removeChatWIndow(chatId);
  };
  const handleClick = (e) => {
    chatWindowStore.setWindowMinimized(false);
  };
  const { name, messageList } = chatWindowStore;
  let lastMessage = '';
  if (messageList.length) {
    [
      {
        data: { text: lastMessage },
      },
    ] = messageList.slice(-1);
  }
  return (
    <ListItem button onClick={handleClick} className={clsx(styles.root, styles.rootHover)}>
      <ListItemIcon>
        <Avatar store={chatWindowStore} className={styles.avatar} />
      </ListItemIcon>
      <>
        {name ? (
          <ListItemText
            primary={name}
            secondary={lastMessage}
            primaryTypographyProps={{ noWrap: true }}
            secondaryTypographyProps={{ noWrap: true }}
            classes={{ primary: styles.primary, secondary: styles.secondary }}
          />
        ) : (
          <Box className={styles.progress}>
            <CircularProgress />
          </Box>
        )}
        <Box position="relative">
          <IconButton onClick={handleClose} className={styles.cancel}>
            <CancelIcon />
          </IconButton>
          {bold && <div className={clsx(styles.float, styles.dot)} />}
        </Box>
      </>
    </ListItem>
  );
};

ChatListItem.propTypes = {
  bold: PropTypes.bool,
  chatWindowStore: PropTypes.shape({
    name: PropTypes.string.isRequired,
    messageList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    setWindowMinimized: PropTypes.func.isRequired,
  }).isRequired,
  chatId: PropTypes.number.isRequired,
};

ChatListItem.defaultProps = {
  bold: false,
};

export default observer(ChatListItem);
