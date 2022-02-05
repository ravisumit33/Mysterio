import React, { useContext, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Button,
  Grid,
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
import PlayerIcon from '@material-ui/icons/PlayCircleFilledRounded';
import Avatar from 'components/Avatar';
import { ChatWindowStoreContext } from 'contexts';
import { observer } from 'mobx-react-lite';
import { appStore, profileStore } from 'stores';
import { ChatStatus } from 'appConstants';
import { fetchUrl } from 'utils';
import ConfirmationDialog from 'components/ConfirmationDialog';

const useStyles = makeStyles((theme) => ({
  icon: {
    height: theme.spacing(2),
    width: theme.spacing(2),
    marginRight: theme.spacing(1),
  },
  infoWindow: {
    maxWidth: '70%',
  },
}));

function ChatHeader(props) {
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
    appStore.removeChatWindow();
    history.push('/');
  };

  const handleLogin = () => {
    handleAlertClose();
    history.push('/login', { from: location });
  };

  const handleAlertClose = () => appStore.setShouldShowAlert(false);

  const handleDeleteRoom = () => {
    appStore.showWaitScreen('Deleting Room');
    fetchUrl(`/api/chat/group_rooms/${roomId}/`, {
      method: 'delete',
    })
      .then(() => {
        handleClose();
        appStore.showAlert({
          text: 'Room deleted successfully.',
          severity: 'success',
        });
      })
      .catch(() => {
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
        appStore.showAlert({
          text: 'Only admin can delete the room.',
          action: alertAction,
          severity: 'error',
        });
      })
      .finally(() => appStore.setShouldShowWaitScreen(false));
  };

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
    <IconButton
      disabled={chatStatus === ChatStatus.NOT_STARTED || chatStatus === ChatStatus.ENDED}
      onClick={() => setShouldShowDeleteConfirmationDialog(true)}
      className={classes.icon}
    >
      <Tooltip title="Delete room" arrow>
        <DeleteIcon fontSize="small" />
      </Tooltip>
    </IconButton>
  );

  return (
    <>
      <Grid item container justifyContent="space-between" alignItems="center">
        <Grid item className={classes.infoWindow}>
          <ListItem disableGutters>
            <ListItemAvatar>
              <Avatar name={name} avatarUrl={avatarUrl} />
            </ListItemAvatar>
            <ListItemText primary={name} primaryTypographyProps={{ noWrap: true }} />
          </ListItem>
        </Grid>
        <Grid item>
          {!chatWindowStore.isGroupChat ? individualChatIcons : groupChatIcons}
          <IconButton
            disabled={
              chatStatus === ChatStatus.NOT_STARTED ||
              chatStatus === ChatStatus.RECONNECT_REQUESTED ||
              chatStatus === ChatStatus.ENDED
            }
            onClick={() => {
              chatWindowStore.togglePlayerOpen();
            }}
            className={classes.icon}
          >
            <Tooltip
              title={`${chatWindowStore.shouldOpenPlayer ? 'Close' : 'Open'} video player`}
              arrow
            >
              <PlayerIcon
                fontSize="small"
                color={chatWindowStore.shouldOpenPlayer ? 'secondary' : 'inherit'}
              />
            </Tooltip>
          </IconButton>
          <IconButton onClick={handleClose} className={classes.icon}>
            <Tooltip title="Close" arrow>
              <CloseIcon fontSize="small" />
            </Tooltip>
          </IconButton>
        </Grid>
      </Grid>
      <ConfirmationDialog
        shouldShow={shouldShowDeleteConfirmationDialog}
        onClose={() => setShouldShowDeleteConfirmationDialog(false)}
        onCancel={() => setShouldShowDeleteConfirmationDialog(false)}
        onContinue={handleDeleteRoom}
        title="Delete this room?"
        description="This will permanently delete this room and all its messages."
      />
    </>
  );
}

export default observer(ChatHeader);
