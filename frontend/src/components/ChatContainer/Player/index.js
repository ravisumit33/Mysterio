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
import { useGetPlayer, useHandlePlayer, useConstant } from 'hooks';
import YouTube from './YouTube';
import PlayerActions from './PlayerActions';

const useStyles = makeStyles((theme) => ({
  section: {
    padding: `${theme.spacing(1)}px`,
  },
}));

function Player(props) {
  const { isSmallScreen } = props;

  const chatWindowStore = useContext(ChatWindowStoreContext);
  const {
    roomInfo,
    playerData,
    roomType,
    playerExists,
    isHost,
    setShouldOpenPlayer,
    handlePlayerDelete,
  } = chatWindowStore;
  const { adminAccess, roomId } = roomInfo;

  const classes = useStyles();
  const embedPlayerRef = useRef(null);
  const playerReady = useConstant(createDeferredPromiseObj);
  const setEmbedPlayerRef = useCallback((player) => {
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
  const [getPlayerState, getPlayerTime] = useGetPlayer(embedPlayerRef);
  const [handlePlay, handlePause, handleSeek] = useHandlePlayer(embedPlayerRef);
  useEffect(() => {
    if (!playerExists || isHost) return;
    playerReady.promise.then(() => {
      if (getPlayerState(playerData) !== playerData.state) {
        switch (playerData.state) {
          case PlayerStatus.PLAYING: {
            handleSeek(playerData);
            handlePlay(playerData);
            break;
          }
          case PlayerStatus.PAUSED: {
            handlePause(playerData);
            break;
          }
          case PlayerStatus.BUFFERING: {
            handleSeek(playerData);
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
    playerExists,
    playerReady.promise,
    getPlayerState,
    getPlayerTime,
    handleSeek,
    handlePlay,
    handlePause,
  ]);

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

  const onPlayerReady = (evt) => {
    playerReady.resolve();
    switch (playerData.name) {
      case PlayerName.YOUTUBE: {
        isHost && syncPlayerTime();
        evt.target.loadVideoById(playerData.video_id);
        evt.target.playVideo();
        break;
      }
      default:
        break;
    }
  };
  const onPlayerStateChange = (state) => {
    if (!isHost) return;
    fetchUrl(`/api/chat/${roomType}_rooms/${roomId}/update_player/`, {
      method: 'patch',
      body: { state, current_time: getPlayerTime(playerData) },
    });
  };

  const getEmbedPlayer = () => {
    switch (playerData.name) {
      case PlayerName.YOUTUBE:
        return (
          <YouTube
            setPlayer={setEmbedPlayerRef}
            size={isSmallScreen ? 20 : 50}
            onReady={onPlayerReady}
            onStateChange={(evt) => onPlayerStateChange(evt.data)}
            showControls={isHost}
          />
        );
      default:
        return undefined;
    }
  };

  const handleSyncFromHost = () => chatWindowStore.syncPlayer();

  const shouldShowPlayerActions = playerExists ? isHost : adminAccess;

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
        {!playerExists && !adminAccess && (
          <Grid item className={classes.section}>
            <Typography variant="h5" color="textSecondary" align="center">
              No video. Ask admin to play.
            </Typography>
          </Grid>
        )}
      </ThemeProvider>
      {playerExists && (
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
