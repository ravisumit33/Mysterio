import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
} from '@material-ui/core';
import ReplayIcon from '@material-ui/icons/Replay';
import RemoveIcon from '@material-ui/icons/Remove';
import CloseIcon from '@material-ui/icons/Close';
import Avatar from 'components/Avatar';
import { ChatWindowStoreContext } from 'contexts';
import { observer } from 'mobx-react-lite';
import { chatContainerStore } from 'stores';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  icon: {
    height: theme.spacing(2),
    width: theme.spacing(2),
  },
  windowInfo: {
    maxWidth: '70%',
  },
}));

const ChatHeader = (props) => {
  const { chatId } = props;
  const classes = useStyles();
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const { name, setWindowMinimized, reconnect } = chatWindowStore;

  const handleMinimize = () => {
    setWindowMinimized(true);
  };

  const handleReconnect = () => {
    reconnect();
  };

  const handleClose = () => {
    chatContainerStore.removeChatWIndow(chatId);
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.windowInfo}>
        <ListItem disableGutters>
          <ListItemAvatar>
            <Avatar />
          </ListItemAvatar>
          <ListItemText primary={name} primaryTypographyProps={{ noWrap: true }} />
        </ListItem>
      </Box>
      <Box>
        <IconButton onClick={handleReconnect} className={classes.icon}>
          <ReplayIcon fontSize="small" />
        </IconButton>
        <IconButton onClick={handleMinimize} className={classes.icon}>
          <RemoveIcon fontSize="small" />
        </IconButton>
        <IconButton onClick={handleClose} className={classes.icon}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

ChatHeader.propTypes = {
  chatId: PropTypes.number.isRequired,
};

export default observer(ChatHeader);
