import React, { useContext, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import YouTubeIcon from '@material-ui/icons/YouTube';
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
  const { name, reconnect, chatStatus, roomId, avatarUrl } = chatWindowStore;
  const history = useHistory();
  const location = useLocation();
  const [shouldShowDeleteConfirmationDialog, setShouldShowDeleteConfirmationDialog] =
    useState(false);

  const handleReconnect = () => {
    reconnect();
  };

  const handleClose = () => {
    appStore.removeChatWIndow();
    history.push('/');
  };

  const handleLogin = () => {
    handleAlertClose();
    history.push('/login', { from: location });
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
        handleClose();
        appStore.setAlert({
          text: 'Room deleted successfully.',
          severity: 'success',
        });
        appStore.setShouldShowAlert(true);
      }
    });
  };

  const deleteConfirmationDialog = (
    <Dialog
      open={shouldShowDeleteConfirmationDialog}
      onClose={() => setShouldShowDeleteConfirmationDialog(false)}
    >
      <DialogTitle>Delete this Room?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This will permanently delete this room and all its messages.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShouldShowDeleteConfirmationDialog(false)} color="primary">
          Cancel
        </Button>
        <Button onClick={handleDeleteRoom} color="primary">
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );

  const individualChatIcons = (
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
  );

  const groupChatIcons = (
    <>
      <IconButton
        disabled={chatStatus === ChatStatus.NOT_STARTED || chatStatus === ChatStatus.ENDED}
        onClick={() => {
          if (chatWindowStore.shouldShowIframe) {
            chatWindowStore.setShouldHideIframe(false);
          } else {
            chatWindowStore.setShouldShowIframe(true);
          }
        }}
        className={classes.icon}
      >
        <Tooltip title="Youtube" arrow>
          <YouTubeIcon fontSize="small" />
        </Tooltip>
      </IconButton>
      <IconButton
        disabled={chatStatus === ChatStatus.NOT_STARTED || chatStatus === ChatStatus.ENDED}
        onClick={() => setShouldShowDeleteConfirmationDialog(true)}
        className={classes.icon}
      >
        <Tooltip title="Delete room" arrow>
          <DeleteIcon fontSize="small" />
        </Tooltip>
      </IconButton>
    </>
  );

  return (
    <>
      <Box className={classes.root}>
        <Box className={classes.infoWindow}>
          <ListItem disableGutters>
            <ListItemAvatar>
              <Avatar name={name} avatarUrl={avatarUrl} />
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
      {deleteConfirmationDialog}
    </>
  );
};

export default observer(ChatHeader);
