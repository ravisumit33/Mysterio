import React, { useContext } from 'react';
import {
  Box,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Tooltip,
} from '@material-ui/core';
import ReplayIcon from '@material-ui/icons/Replay';
import CloseIcon from '@material-ui/icons/Close';
import Avatar from 'components/Avatar';
import { ChatWindowStoreContext } from 'contexts';
import { observer } from 'mobx-react-lite';
import { appStore } from 'stores';
import { ChatStatus } from 'appConstants';

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
    marginRight: theme.spacing(1),
  },
  infoWindow: {
    maxWidth: '70%',
  },
}));

const ChatHeader = (props) => {
  const classes = useStyles();
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const { name, reconnect, chatStatus } = chatWindowStore;

  const handleReconnect = () => {
    reconnect();
  };

  const handleClose = () => {
    appStore.removeChatWIndow();
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.infoWindow}>
        <ListItem disableGutters>
          <ListItemAvatar>
            <Avatar />
          </ListItemAvatar>
          <ListItemText primary={name} primaryTypographyProps={{ noWrap: true }} />
        </ListItem>
      </Box>
      <Box>
        {!chatWindowStore.isGroupChat && (
          <IconButton
            disabled={
              chatStatus === ChatStatus.NOT_STARTED || chatStatus === ChatStatus.RECONNECT_REQUESTED
            }
            onClick={handleReconnect}
            className={classes.icon}
          >
            <Tooltip title="Find someone else" arrow>
              <ReplayIcon fontSize="small" />
            </Tooltip>
          </IconButton>
        )}
        <IconButton onClick={handleClose} className={classes.icon}>
          <Tooltip title="Close" arrow>
            <CloseIcon fontSize="small" />
          </Tooltip>
        </IconButton>
      </Box>
    </Box>
  );
};

export default observer(ChatHeader);
