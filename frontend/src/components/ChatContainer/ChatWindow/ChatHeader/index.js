import React, { useContext } from 'react';
import {
  Box,
  Button,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Tooltip,
} from '@material-ui/core';
import ReplayIcon from '@material-ui/icons/Replay';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import Avatar from 'components/Avatar';
import { ChatWindowStoreContext } from 'contexts';
import { observer } from 'mobx-react-lite';
import { appStore, profileStore } from 'stores';
import { ChatStatus } from 'appConstants';
import { fetchUrl } from 'utils';

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
  const { name, reconnect, chatStatus, roomId } = chatWindowStore;

  const handleReconnect = () => {
    reconnect();
  };

  const handleClose = () => {
    appStore.removeChatWIndow();
  };

  const handleLogin = () => {
    handleAlertClose();
    appStore.setShouldOpenLoginSignupDialog(true);
  };

  const handleAlertClose = () => appStore.setShouldShowAlert(false);

  const handleDeleteRoom = () => {
    fetchUrl(`/api/chat/groups/${roomId}/`, {
      method: 'delete',
    }).then((response) => {
      if (response.status >= 400) {
        const alertAction = profileStore.isLoggedIn ? undefined : (
          <>
            <Button color="secondary" size="small" onClick={handleLogin} variant="text">
              login
            </Button>
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleAlertClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        );
        appStore.setAlert({
          text: 'Only admin can delete the room.',
          action: alertAction,
          severity: 'error',
        });
        appStore.setShouldShowAlert(true);
      } else {
        appStore.removeChatWIndow();
        appStore.setAlert({
          text: 'Room deleted successfully.',
          severity: 'success',
        });
        appStore.setShouldShowAlert(true);
        fetchUrl('/api/chat/groups/').then((resp) => {
          appStore.setGroupRooms(Object.values(resp.data));
        });
      }
    });
  };

  const individualChatIcons = (
    <>
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
    </>
  );

  const groupChatIcons = (
    <>
      <IconButton onClick={handleDeleteRoom} className={classes.icon}>
        <Tooltip title="Delete room" arrow>
          <DeleteIcon fontSize="small" />
        </Tooltip>
      </IconButton>
    </>
  );

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
        {!chatWindowStore.isGroupChat ? individualChatIcons : groupChatIcons}
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
