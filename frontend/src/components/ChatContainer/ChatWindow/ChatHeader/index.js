import React, { useContext, useMemo } from 'react';
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
import PlayerIcon from '@mui/icons-material/PlayCircleFilledRounded';
import FavoriteIcon from '@mui/icons-material/FavoriteBorder';
import { observer } from 'mobx-react-lite';
import CustomAvatar from 'components/Avatar';
import { ChatWindowStoreContext } from 'contexts';
import { ChatStatus } from 'appConstants';
import Animation from 'components/Animation';
import playingJson from 'assets/animations/playing.json';
import likeJson from 'assets/animations/like.json';
import { useSearchParams } from 'hooks';
import MoreMenu from './MoreMenu';

const useStyles = makeStyles((theme) => ({
  icon: {
    height: theme.spacing(2),
    width: theme.spacing(2),
    marginRight: theme.spacing(1),
  },
  infoWindow: {
    maxWidth: '60%', // maxWidth is required to convert the name to ellipsis instead of overflowing
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
  const { isFavorite } = roomInfo;
  const history = useHistory();
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
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
          sx={{ zIndex: theme.zIndex.snackbar + 1 }}
          size="large"
        >
          <ReplayIcon />
        </IconButton>
      </Tooltip>
    );
  }, [chatStatus, classes.icon, history, theme.zIndex.snackbar]);

  const groupChatIcons = useMemo(() => {
    const shouldDisable = chatStatus === ChatStatus.NOT_STARTED || chatStatus === ChatStatus.ENDED;
    return (
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
    );
  }, [LikeAnimation, chatStatus, classes.icon, isFavorite, toggleLikeRoom]);

  const moreMenu = useMemo(
    () => <MoreMenu isGroupChat={chatWindowStore.isGroupChat} className={classes.icon} />,
    [chatWindowStore.isGroupChat, classes.icon]
  );

  const avatarIcon = useMemo(
    () => <CustomAvatar name={name} avatarUrl={avatarUrl} />,
    [avatarUrl, name]
  );

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" spacing={1} className={classes.infoWindow}>
          {avatarIcon}
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
                const newUrlSearchParams = new URLSearchParams(searchParams.toString());
                if (newUrlSearchParams.get('playerOpen') === 'true') {
                  newUrlSearchParams.delete('playerOpen');
                } else {
                  newUrlSearchParams.set('playerOpen', 'true');
                }
                // @ts-ignore
                setSearchParams(newUrlSearchParams);
              }}
              className={classes.icon}
              size="large"
            >
              {chatWindowStore.playerExists ? PlayingAnimation : <PlayerIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Close" arrow>
            <IconButton
              onClick={() => history.push('/')}
              className={classes.icon}
              sx={{ zIndex: theme.zIndex.snackbar + 1 }}
              size="large"
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
          {moreMenu}
        </Stack>
      </Stack>
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
