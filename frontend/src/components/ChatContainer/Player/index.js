import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  createTheme,
  Grid,
  ThemeProvider,
  StyledEngineProvider,
  Typography,
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import { ChatWindowStoreContext } from 'contexts';
import { createDeferredPromiseObj, fetchUrl } from 'utils';
import { observer } from 'mobx-react-lite';
import { PlayerName, PlayerStatus } from 'appConstants';
import { useConstant, useGetPlayer, useHandlePlayer } from 'hooks';
import RouterLink from 'components/RouterLink';
import YouTube from './YouTube';
import PlayerActions from './PlayerActions';

function Player(props) {
  const { isSmallScreen } = props;

  const chatWindowStore = useContext(ChatWindowStoreContext);
  const {
    roomInfo,
    playerData,
    roomType,
    playerSynced,
    isHost,
    setShouldOpenPlayer,
    handlePlayerDelete,
  } = chatWindowStore;
  const { adminAccess, roomId } = roomInfo;

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
    if (!playerSynced || isHost) return;
    playerReady.promise.then(() => {
      if (getPlayerState(playerData) !== playerData.state) {
        handleSeek(playerData);
        switch (playerData.state) {
          case PlayerStatus.PLAYING: {
            handlePlay(playerData);
            break;
          }
          case PlayerStatus.PAUSED: {
            handlePause(playerData);
            break;
          }
          case PlayerStatus.BUFFERING: {
            break;
          }
          default:
            break;
        }
      } else if (getPlayerTime(playerData) !== playerData.current_time) {
        handleSeek(playerData);
      }
    });
  }, [
    playerData,
    isHost,
    playerSynced,
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
          fetchUrl(`/api/chat/${roomType}_rooms/${roomId}/update_player/`, {
            method: 'patch',
            body: { current_time: getPlayerTime(playerData) },
          }).finally(() => {
            if (syncTimeoutRef.current) {
              syncPlayerTime();
            }
          });
        }, 1000);
      };
      switch (playerData.name) {
        case PlayerName.YOUTUBE: {
          evt.target.cueVideoById({
            videoId: playerData.video_id,
            startSeconds: playerData.current_time,
          });
          isHost && syncPlayerTime();
          break;
        }
        default:
          break;
      }
    },
    [getPlayerTime, isHost, playerData, roomId, roomType]
  );
  const onPlayerStateChange = useCallback(
    (state) => {
      switch (state) {
        case PlayerStatus.CUED: {
          isHost && handlePlay(playerData);
          playerReady.resolve();
          break;
        }
        default:
          break;
      }
      isHost &&
        playerReady.promise.then(() => {
          fetchUrl(`/api/chat/${roomType}_rooms/${roomId}/update_player/`, {
            method: 'patch',
            body: { state, current_time: getPlayerTime(playerData) },
          });
        });
    },
    [getPlayerTime, handlePlay, isHost, playerData, playerReady, roomId, roomType]
  );

  const getEmbedPlayer = () => {
    switch (playerData.name) {
      case PlayerName.YOUTUBE:
        return (
          <YouTube
            size={isSmallScreen ? 20 : 50}
            onReady={onPlayerReady}
            onStateChange={(evt) => onPlayerStateChange(evt.data)}
            showControls={isHost}
            setPlayer={setEmbedPlayer}
          />
        );
      default:
        return undefined;
    }
  };

  const handleSyncFromHost = () => chatWindowStore.syncPlayer();

  const shouldShowPlayerActions = playerSynced ? isHost : adminAccess;

  const darkModeTheme = useMemo(() => createTheme({ palette: { mode: 'dark' } }), []);
  return (
    <Grid item container direction="column" xs alignItems="stretch" rowSpacing={1}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={darkModeTheme}>
          {shouldShowPlayerActions && (
            <Grid item container alignItems="center">
              <PlayerActions />
            </Grid>
          )}
          {!playerSynced && !adminAccess && (
            <Grid item>
              <Typography variant="h5" color="textSecondary" align="center">
                No video. Only admin can play. If you have admin rights,
                <RouterLink to="/login"> login </RouterLink> and try again.
              </Typography>
            </Grid>
          )}
        </ThemeProvider>
      </StyledEngineProvider>
      <Grid item container direction="column" alignItems="center">
        {playerSynced && <Grid item>{getEmbedPlayer()}</Grid>}
        <Grid item container justifyContent="center" columnSpacing={2}>
          {playerSynced && !isHost && (
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                endIcon={<SyncIcon />}
                onClick={() => handleSyncFromHost()}
              >
                Sync
              </Button>
            </Grid>
          )}
          <Grid item>
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
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

Player.propTypes = {
  isSmallScreen: PropTypes.bool,
};

Player.defaultProps = {
  isSmallScreen: false,
};

export default observer(Player);
