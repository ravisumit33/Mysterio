import React, { useContext, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import ReplayIcon from '@mui/icons-material/Replay';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayerIcon from '@mui/icons-material/PlayCircleFilledRounded';
import FavoriteIcon from '@mui/icons-material/FavoriteBorder';
import { observer } from 'mobx-react-lite';
import CustomAvatar from 'components/Avatar';
import { ChatWindowStoreContext } from 'contexts';
import { appStore } from 'stores';
import { ChatStatus } from 'appConstants';
import { fetchUrl } from 'utils';
import ConfirmationDialog from 'components/ConfirmationDialog';
import Animation from 'components/Animation';
import playingJson from 'assets/animations/playing.json';
import likeJson from 'assets/animations/like.json';

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

function ChatHeader() {
  const classes = useStyles();
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const { name, avatarUrl, chatStatus, roomInfo, toggleLikeRoom } = chatWindowStore;
  const { roomId, isFavorite } = roomInfo;
  const history = useHistory();
  const [shouldShowDeleteConfirmationDialog, setShouldShowDeleteConfirmationDialog] =
    useState(false);

  const handleDeleteRoom = () => {
    appStore.showWaitScreen('Deleting Room');
    fetchUrl(`/api/chat/group_rooms/${roomId}/`, {
      method: 'delete',
    })
      .then(() => {
        appStore.removeChatWindow();
        history.push('/');
        appStore.showAlert({
          text: 'Room deleted successfully.',
          severity: 'success',
        });
      })
      .catch((error) => {
        if (error.status === 401 || error.status === 403) {
          appStore.showAlert({
            text: 'Only creator can delete the room.',
            action: 'login',
            severity: 'error',
          });
        } else {
          appStore.showAlert({
            text: 'Error occurred while deleting. Try again later.',
            severity: 'error',
          });
        }
      })
      .finally(() => {
        appStore.setShouldShowWaitScreen(false);
        setShouldShowDeleteConfirmationDialog(false);
      });
  };

  const PlayingAnimation = useMemo(
    () => <Animation containerId="videoPlaying" animationData={playingJson} />,
    []
  );

  const LikeAnimation = useMemo(
    () => (
      <Animation containerId="like" animationData={likeJson} loop={false} width={6} height={6} />
    ),
    []
  );

  const individualChatIcons = useMemo(() => {
    const handleReconnect = () => {
      appStore.reconnect();
    };
    const shouldDisable = chatStatus === ChatStatus.NOT_STARTED;
    return (
      <IconButton
        disabled={shouldDisable}
        onClick={handleReconnect}
        className={classes.icon}
        size="large"
      >
        <Tooltip title="Find someone else" arrow>
          <ReplayIcon />
        </Tooltip>
      </IconButton>
    );
  }, [chatStatus, classes.icon]);

  const groupChatIcons = useMemo(() => {
    const shouldDisable = chatStatus === ChatStatus.NOT_STARTED || chatStatus === ChatStatus.ENDED;
    return (
      <>
        <IconButton
          disabled={shouldDisable}
          onClick={() => setShouldShowDeleteConfirmationDialog(true)}
          className={classes.icon}
          size="large"
        >
          <Tooltip title="Delete room" arrow>
            <DeleteIcon />
          </Tooltip>
        </IconButton>

        <IconButton
          disabled={shouldDisable}
          onClick={() => toggleLikeRoom()}
          className={classes.icon}
          size="large"
        >
          <Tooltip title={isFavorite ? 'Remove from favorite' : 'Mark as favorite'} arrow>
            {!shouldDisable && isFavorite ? <div>{LikeAnimation}</div> : <FavoriteIcon />}
          </Tooltip>
        </IconButton>
      </>
    );
  }, [LikeAnimation, chatStatus, classes.icon, isFavorite, toggleLikeRoom]);

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box className={classes.infoWindow}>
          <ListItem disableGutters>
            <ListItemAvatar>
              <CustomAvatar name={name} avatarUrl={avatarUrl} />
            </ListItemAvatar>
            <ListItemText primary={name} primaryTypographyProps={{ variant: 'h5', noWrap: true }} />
          </ListItem>
        </Box>
        <Stack direction="row">
          {!chatWindowStore.isGroupChat ? individualChatIcons : groupChatIcons}
          <IconButton
            disabled={chatStatus !== ChatStatus.ONGOING}
            onClick={() => {
              chatWindowStore.togglePlayerOpen();
            }}
            className={classes.icon}
            size="large"
          >
            <Tooltip
              title={`${chatWindowStore.shouldOpenPlayer ? 'Close' : 'Open'} video player`}
              arrow
            >
              {chatWindowStore.playerExists ? <div>{PlayingAnimation}</div> : <PlayerIcon />}
            </Tooltip>
          </IconButton>
          <IconButton onClick={() => history.push('/')} className={classes.icon} size="large">
            <Tooltip title="Close" arrow>
              <CloseIcon />
            </Tooltip>
          </IconButton>
        </Stack>
      </Stack>
      <ConfirmationDialog
        shouldShow={shouldShowDeleteConfirmationDialog}
        onClose={() => setShouldShowDeleteConfirmationDialog(false)}
        onCancel={() => setShouldShowDeleteConfirmationDialog(false)}
        onConfirm={handleDeleteRoom}
        title="Delete this room?"
        description="This will permanently delete this room and all its messages."
      />
    </>
  );
}

export default observer(ChatHeader);
