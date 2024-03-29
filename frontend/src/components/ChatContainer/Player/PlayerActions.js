import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import YouTubeIcon from '@material-ui/icons/YouTube';
import { appStore } from 'stores';
import { ChatWindowStoreContext } from 'contexts';
import { MessageType, PlayerName, renderPlayerName } from 'appConstants';

function PlayerActions() {
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [videoPlayer, setVideoPlayer] = useState(PlayerName.YOUTUBE);
  const [videoUrl, setVideoUrl] = useState('');

  const { socket } = chatWindowStore;
  useEffect(() => {
    if (selectedPlayer && selectedVideoId) {
      const playerData = {
        name: selectedPlayer,
        videoId: selectedVideoId,
      };
      socket.send(MessageType.PLAYER_INFO, playerData);
    }
  }, [selectedVideoId, selectedPlayer, socket]);

  const getPlayerIcon = (player) => {
    switch (player) {
      case PlayerName.YOUTUBE:
        return <YouTubeIcon color="error" fontSize="large" />;
      default:
        return undefined;
    }
  };

  const handleInvalidInput = () =>
    appStore.showAlert({
      text: 'Invalid video link',
      severity: 'error',
    });

  const setVideoIdFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      let videoId = '';
      switch (videoPlayer) {
        case PlayerName.YOUTUBE: {
          if (urlObj.hostname === 'youtu.be') {
            const { pathname } = urlObj;
            videoId = pathname.substr(pathname.indexOf('/') + 1);
          } else if (urlObj.hostname === 'www.youtube.com') {
            videoId = urlObj.searchParams.get('v');
          }
          break;
        }
        default:
          break;
      }
      if (videoId) {
        setSelectedVideoId(videoId);
        setSelectedPlayer(videoPlayer);
      } else {
        handleInvalidInput();
      }
    } catch {
      handleInvalidInput();
    }
  };

  return (
    <Grid container direction="column" alignItems="center">
      <Grid item xs={12} container justifyContent="space-evenly" spacing={3} alignItems="center">
        <Grid item>
          <Box maxWidth={120}>
            <FormControl fullWidth>
              <InputLabel id="video-player-select-label">Player</InputLabel>
              <Select
                labelId="video-player-select-label"
                id="video-player-select"
                value={videoPlayer}
                label="Video Player Select"
                // @ts-ignore
                onChange={(evt) => setVideoPlayer(evt.target.value)}
                renderValue={(value) => getPlayerIcon(value)}
                MenuProps={{
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  getContentAnchorEl: null,
                }}
              >
                <MenuItem value={PlayerName.YOUTUBE}>
                  {getPlayerIcon(PlayerName.YOUTUBE)}
                  <Box component="span" px={1}>
                    <Typography variant="subtitle1">
                      {renderPlayerName(PlayerName.YOUTUBE)}
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
        <Grid item xs sm={6}>
          <form
            onSubmit={(evt) => {
              evt.preventDefault();
              setVideoIdFromUrl(videoUrl);
            }}
          >
            <Grid container spacing={1} alignItems="center">
              <Grid item xs>
                <TextField
                  variant="outlined"
                  label={`Enter ${renderPlayerName(videoPlayer)} Link`}
                  fullWidth
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item>
                <Button
                  disabled={!videoUrl}
                  size="medium"
                  variant="contained"
                  color="secondary"
                  type="submit"
                >
                  Play
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="caption" color="textSecondary">
          ** Some videos may be unavailable due to copyright **
        </Typography>
      </Grid>
    </Grid>
  );
}

export default PlayerActions;
