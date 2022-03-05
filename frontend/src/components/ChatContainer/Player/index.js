import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  createTheme,
  Grid,
  makeStyles,
  ThemeProvider,
  Typography,
} from '@material-ui/core';
import SyncIcon from '@material-ui/icons/Sync';
import { ChatWindowStoreContext } from 'contexts';
import { createDeferredPromiseObj, fetchUrl } from 'utils';
import { observer } from 'mobx-react-lite';
import { PlayerName, PlayerStatus } from 'appConstants';
import { useConstant, useGetPlayer, useHandlePlayer } from 'hooks';
import YouTube from './YouTube';
import PlayerActions from './PlayerActions';

const useStyles = makeStyles((theme) => ({
  section: {
    padding: theme.spacing(1),
  },
}));

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

  const classes = useStyles();
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

  const darkModeTheme = useMemo(() => createTheme({ palette: { type: 'dark' } }), []);
  return (
    <Grid
      item
      container
      direction="column"
      xs
      alignItems="stretch"
      justifyContent={isSmallScreen ? 'space-evenly' : undefined}
    >
      <ThemeProvider theme={darkModeTheme}>
        {shouldShowPlayerActions && (
          <Grid item className={classes.section}>
            <PlayerActions />
          </Grid>
        )}
        {!playerSynced && !adminAccess && (
          <Grid item className={classes.section}>
            <Typography variant="h5" color="textSecondary" align="center">
              No video. Ask admin to play.
            </Typography>
          </Grid>
        )}
      </ThemeProvider>
      {playerSynced && (
        <Grid
          item
          container
          direction="column"
          alignItems="center"
          justifyContent="space-evenly"
          spacing={1}
          className={classes.section}
        >
          <Grid item className={classes.section}>
            {getEmbedPlayer()}
          </Grid>
          <Grid item container justifyContent="center" className={classes.section} spacing={2}>
            {!isHost && (
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
      )}
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
