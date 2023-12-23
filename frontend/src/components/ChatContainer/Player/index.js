import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Button,
  createTheme,
  ThemeProvider,
  StyledEngineProvider,
  Typography,
  Stack,
  Container,
  useMediaQuery,
  Box,
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import { ChatWindowStoreContext } from 'contexts';
import { createDeferredPromiseObj } from 'utils';
import { observer } from 'mobx-react-lite';
import { PlayerName, PlayerStatus } from 'appConstants';
import { useGetPlayer, useHandlePlayer } from 'hooks';
import RouterLink from 'components/RouterLink';
import { appStore, profileStore } from 'stores';
import YouTube from './YouTube';
import PlayerActions from './PlayerActions';

function Player() {
  const location = useLocation();
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const {
    roomInfo,
    syncedPlayerData,
    isHost,
    setShouldOpenPlayer,
    handlePlayerDelete,
    updatePlayer,
  } = chatWindowStore;
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
  const playerDataRef = useRef(null);
  if (
    syncedPlayerData &&
    (!playerDataRef.current || syncedPlayerData.name !== playerDataRef.current.playerName)
  ) {
    playerDataRef.current = {
      playerReady: createDeferredPromiseObj(),
      playerName: syncedPlayerData.name,
    };
  }

  const setEmbedPlayer = useCallback((player) => {
    embedPlayerRef.current = player;
  }, []);
  const syncIntervalRef = useRef(null);
  useEffect(
    () => () => {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    },
    []
  );
  const { getPlayerState, getPlayerTime, getPlayerId } = useGetPlayer(embedPlayerRef);
  const { handleCue, handlePlay, handlePause, handleSeek } = useHandlePlayer(embedPlayerRef);
  useEffect(() => {
    if (!syncedPlayerData) return;
    const { playerReady, playerName } = playerDataRef.current;
    playerReady.promise.then(() => {
      if (getPlayerId(playerName) !== syncedPlayerData.video_id) {
        handleCue(syncedPlayerData);
      } else if (!isHost) {
        if (getPlayerState(playerName) !== syncedPlayerData.state) {
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
        } else if (getPlayerTime(playerName) !== syncedPlayerData.current_time) {
          handleSeek(syncedPlayerData);
        }
      }
    });
  }, [
    syncedPlayerData,
    isHost,
    getPlayerState,
    getPlayerTime,
    handleSeek,
    handlePlay,
    handlePause,
    getPlayerId,
    handleCue,
  ]);

  const onPlayerReady = useCallback(
    (evt) => {
      const { playerName } = playerDataRef.current;
      clearInterval(syncIntervalRef.current);
      handleCue(syncedPlayerData);
      if (isHost) {
        syncIntervalRef.current = setInterval(() => {
          updatePlayer({ current_time: getPlayerTime(playerName) });
        }, 1000);
      }
    },
    [getPlayerTime, handleCue, isHost, syncedPlayerData, updatePlayer]
  );
  const onPlayerStateChange = useCallback(
    (state) => {
      const { playerReady, playerName } = playerDataRef.current;
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
          updatePlayer({
            state,
            current_time: getPlayerTime(playerName),
          });
        });
    },
    [getPlayerTime, handlePlay, isHost, syncedPlayerData, updatePlayer]
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
                    <RouterLink to={{ pathname: '/login', state: { from: location } }}>
                      login
                    </RouterLink>
                    and try again.
                  </>
                )}
              </Typography>
            )}
          </ThemeProvider>
        </StyledEngineProvider>
        <Stack spacing={1} alignItems="center" sx={{ mt: 2 }}>
          {syncedPlayerData && (
            <Box
              onClick={() => {
                !isHost &&
                  appStore.showAlert({ text: 'Only host can change video', severity: 'error' });
              }}
            >
              {getEmbedPlayer()}
            </Box>
          )}
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
