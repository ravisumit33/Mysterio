import React, { useContext } from 'react';
import PropTypes from 'prop-types';
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
  infoWindow: {
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
      <Box className={classes.infoWindow}>
        <ListItem disableGutters>
          <ListItemAvatar>
            <Avatar />
          </ListItemAvatar>
          <ListItemText primary={name} primaryTypographyProps={{ noWrap: true }} />
        </ListItem>
      </Box>
      <Box>
        <IconButton onClick={handleReconnect} className={classes.icon}>
          <Tooltip title="Find someone else" arrow>
            <ReplayIcon fontSize="small" />
          </Tooltip>
        </IconButton>
        <IconButton onClick={handleMinimize} className={classes.icon}>
          <Tooltip title="Minimize" arrow>
            <RemoveIcon fontSize="small" />
          </Tooltip>
        </IconButton>
        <IconButton onClick={handleClose} className={classes.icon}>
          <Tooltip title="Close" arrow>
            <CloseIcon fontSize="small" />
          </Tooltip>
        </IconButton>
      </Box>
    </Box>
  );
};

ChatHeader.propTypes = {
  chatId: PropTypes.number.isRequired,
};

export default observer(ChatHeader);
