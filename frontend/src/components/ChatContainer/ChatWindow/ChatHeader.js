import React, { useContext, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  CircularProgress,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
  useTheme,
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
    maxWidth: '60%',
    padding: theme.spacing(1, 0),
  },
  snackbarContentRoot: {
    flexGrow: 'initial',
    minWidth: 'unset',
  },
}));

function ChatHeader() {
  const classes = useStyles();
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const { name, avatarUrl, chatStatus, roomInfo, toggleLikeRoom } = chatWindowStore;
  const { roomId, isFavorite } = roomInfo;
  const history = useHistory();
  const theme = useTheme();
  const [shouldShowDeleteConfirmationDialog, setShouldShowDeleteConfirmationDialog] =
    useState(false);

  const handleDeleteRoom = () => {
    appStore.showWaitScreen('Deleting Room');
    fetchUrl(`/api/chat/rooms/${roomId}/`, {
      method: 'delete',
      headers: { 'X-Room-Password': roomInfo.password },
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
    () => (
      <div>
        <Animation containerId="videoPlaying" animationData={playingJson} />
      </div>
    ),
    []
  );

  const LikeAnimation = useMemo(
    () => (
      <div>
        <Animation containerId="like" animationData={likeJson} loop={false} width={6} height={6} />
      </div>
    ),
    []
  );

  const ReconnectingMessage = useMemo(
    () => (
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={3}>
        <Typography variant="body2">Reconnecting...</Typography>
        <CircularProgress color="inherit" size={theme.spacing(2.5)} />
      </Stack>
    ),
    [theme]
  );

  const individualChatIcons = useMemo(() => {
    const handleReconnect = () => history.replace('/chat/match/');
    const shouldDisable = chatStatus === ChatStatus.NOT_STARTED;
    return (
      <Tooltip title="Find match again" arrow>
        <IconButton
          disabled={shouldDisable}
          onClick={handleReconnect}
          className={classes.icon}
          size="large"
        >
          <ReplayIcon />
        </IconButton>
      </Tooltip>
    );
  }, [chatStatus, classes.icon, history]);

  const groupChatIcons = useMemo(() => {
    const shouldDisable = chatStatus === ChatStatus.NOT_STARTED || chatStatus === ChatStatus.ENDED;
    return (
      <>
        <Tooltip title="Delete room" arrow>
          <IconButton
            disabled={shouldDisable}
            onClick={() => setShouldShowDeleteConfirmationDialog(true)}
            className={classes.icon}
            size="large"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={isFavorite ? 'Remove from favorite' : 'Mark as favorite'} arrow>
          <IconButton
            disabled={shouldDisable}
            onClick={() => toggleLikeRoom()}
            className={classes.icon}
            size="large"
          >
            {!shouldDisable && isFavorite ? LikeAnimation : <FavoriteIcon />}
          </IconButton>
        </Tooltip>
      </>
    );
  }, [LikeAnimation, chatStatus, classes.icon, isFavorite, toggleLikeRoom]);

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        className={classes.root}
      >
        <Stack direction="row" alignItems="center" spacing={1} className={classes.infoWindow}>
          <CustomAvatar name={name} avatarUrl={avatarUrl} />
          <Typography variant="h5" noWrap sx={{ ml: 1 }}>
            {name}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center">
          {!chatWindowStore.isGroupChat ? individualChatIcons : groupChatIcons}
          <Tooltip
            title={`${chatWindowStore.shouldOpenPlayer ? 'Close' : 'Open'} video player`}
            arrow
          >
            <IconButton
              disabled={chatStatus !== ChatStatus.ONGOING}
              onClick={() => {
                chatWindowStore.togglePlayerOpen();
              }}
              className={classes.icon}
              size="large"
            >
              {chatWindowStore.playerExists ? PlayingAnimation : <PlayerIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Close" arrow>
            <IconButton onClick={() => history.push('/')} className={classes.icon} size="large">
              <CloseIcon />
            </IconButton>
          </Tooltip>
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
      <Snackbar
        open={chatStatus === ChatStatus.RECONNECTING}
        message={ReconnectingMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        ContentProps={{ classes: { root: classes.snackbarContentRoot } }}
      />
    </>
  );
}

export default observer(ChatHeader);
