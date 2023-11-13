import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import {
  Button,
  createTheme,
  ThemeProvider,
  StyledEngineProvider,
  Typography,
  Stack,
  Container,
  useMediaQuery,
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import { ChatWindowStoreContext } from 'contexts';
import { createDeferredPromiseObj, fetchUrl } from 'utils';
import { observer } from 'mobx-react-lite';
import { PlayerName, PlayerStatus } from 'appConstants';
import { useConstant, useGetPlayer, useHandlePlayer } from 'hooks';
import RouterLink from 'components/RouterLink';
import { profileStore } from 'stores';
import YouTube from './YouTube';
import PlayerActions from './PlayerActions';

function Player() {
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const { roomInfo, syncedPlayerData, isHost, setShouldOpenPlayer, handlePlayerDelete } =
    chatWindowStore;
  const { adminAccess } = roomInfo;
  // @ts-ignore
  const isScreenSmallerThanLg = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  // @ts-ignore
  const isScreenSmallerThanMd = useMediaQuery((theme) => theme.breakpoints.down('md'));
  // @ts-ignore
  const isScreenSmallerThanSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const isXSmallScreen = isScreenSmallerThanSm;
  const isSmallScreen = isScreenSmallerThanMd && !isXSmallScreen;
  const isMediumScreen = isScreenSmallerThanLg && !isSmallScreen && !isXSmallScreen;

  const embedPlayerRef = useRef(null);
  const playerReady = useConstant(createDeferredPromiseObj);
  const setEmbedPlayer = useCallback((player) => {
    embedPlayerRef.current = player;
  }, []);
  const syncTimeoutRef = useRef(null);
  useEffect(
    () => () => {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    },
    []
  );
  const { getPlayerState, getPlayerTime } = useGetPlayer(embedPlayerRef);
  const { handlePlay, handlePause, handleSeek } = useHandlePlayer(embedPlayerRef);
  useEffect(() => {
    if (!syncedPlayerData || isHost) return;
    playerReady.promise.then(() => {
      if (getPlayerState(syncedPlayerData) !== syncedPlayerData.state) {
        handleSeek(syncedPlayerData);
        switch (syncedPlayerData.state) {
          case PlayerStatus.PLAYING: {
            handlePlay(syncedPlayerData);
            break;
          }
          case PlayerStatus.PAUSED: {
            handlePause(syncedPlayerData);
            break;
          }
          case PlayerStatus.BUFFERING: {
            break;
          }
          default:
            break;
        }
      } else if (getPlayerTime(syncedPlayerData) !== syncedPlayerData.current_time) {
        handleSeek(syncedPlayerData);
      }
    });
  }, [
    syncedPlayerData,
    isHost,
    playerReady.promise,
    getPlayerState,
    getPlayerTime,
    handleSeek,
    handlePlay,
    handlePause,
  ]);

  const onPlayerReady = useCallback(
    (evt) => {
      const syncPlayerTime = () => {
        syncTimeoutRef.current = setTimeout(() => {
          fetchUrl(`/api/chat/players/${syncedPlayerData.id}/`, {
            method: 'patch',
            body: { current_time: getPlayerTime(syncedPlayerData) },
          }).finally(() => {
            if (syncTimeoutRef.current) {
              syncPlayerTime();
            }
          });
        }, 1000);
      };
      switch (syncedPlayerData.name) {
        case PlayerName.YOUTUBE: {
          evt.target.cueVideoById({
            videoId: syncedPlayerData.video_id,
            startSeconds: syncedPlayerData.current_time,
          });
          isHost && syncPlayerTime();
          break;
        }
        default:
          break;
      }
    },
    [getPlayerTime, isHost, syncedPlayerData]
  );
  const onPlayerStateChange = useCallback(
    (state) => {
      switch (state) {
        case PlayerStatus.CUED: {
          isHost && handlePlay(syncedPlayerData);
          playerReady.resolve();
          break;
        }
        default:
          break;
      }
      isHost &&
        playerReady.promise.then(() => {
          fetchUrl(`/api/chat/players/${syncedPlayerData.id}/`, {
            method: 'patch',
            body: { state, current_time: getPlayerTime(syncedPlayerData) },
          });
        });
    },
    [getPlayerTime, handlePlay, isHost, syncedPlayerData, playerReady]
  );

  const getEmbedPlayer = () => {
    switch (syncedPlayerData.name) {
      case PlayerName.YOUTUBE: {
        let playerSize = 47;
        if (isMediumScreen) {
          playerSize = 38;
        } else if (isSmallScreen) {
          playerSize = 29;
        } else if (isXSmallScreen) {
          playerSize = 20;
        }
        return (
          <YouTube
            size={playerSize}
            onReady={onPlayerReady}
            onStateChange={(evt) => onPlayerStateChange(evt.data)}
            showControls={isHost}
            setPlayer={setEmbedPlayer}
          />
        );
      }
      default:
        return undefined;
    }
  };

  const handleSyncFromHost = () => chatWindowStore.syncPlayer();

  const shouldShowPlayerActions = syncedPlayerData ? isHost : adminAccess;

  const darkModeTheme = useMemo(() => createTheme({ palette: { mode: 'dark' } }), []);
  return (
    <Container maxWidth="md">
      <Stack alignItems="stretch" sx={{ my: 2 }}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={darkModeTheme}>
            {shouldShowPlayerActions && <PlayerActions />}
            {!syncedPlayerData && !adminAccess && (
              <Typography variant="h5" color="textSecondary" align="center">
                No video. Only admin can play.
                {!profileStore.isLoggedIn && (
                  <>
                    If you have admin rights,
                    <RouterLink to="/login"> login </RouterLink> and try again.
                  </>
                )}
              </Typography>
            )}
          </ThemeProvider>
        </StyledEngineProvider>
        <Stack spacing={1} alignItems="center" sx={{ mt: 2 }}>
          {syncedPlayerData && getEmbedPlayer()}
          <Stack direction="row" justifyContent="center" spacing={2}>
            {syncedPlayerData && !isHost && (
              <Button
                variant="contained"
                color="secondary"
                endIcon={<SyncIcon />}
                onClick={() => handleSyncFromHost()}
              >
                Sync
              </Button>
            )}
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setShouldOpenPlayer(false);
                handlePlayerDelete();
              }}
            >
              Close
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}

export default observer(Player);
