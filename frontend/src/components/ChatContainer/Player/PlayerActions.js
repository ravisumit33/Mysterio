import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { appStore } from 'stores';
import { ChatWindowStoreContext } from 'contexts';
import { MessageType, PlayerName, renderPlayerName } from 'appConstants';
import { getVideoIdFromUrl } from 'utils';

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
    const videoId = getVideoIdFromUrl(url, videoPlayer);
    if (videoId) {
      setSelectedVideoId(videoId);
      setSelectedPlayer(videoPlayer);
    } else {
      handleInvalidInput();
    }
  };

  return (
    <Stack>
      <Stack direction="row" alignItems="center" spacing={3}>
        <Box>
          <FormControl fullWidth>
            <InputLabel id="video-player-select-label">Player</InputLabel>
            <Select
              variant="standard"
              labelId="video-player-select-label"
              id="video-player-select"
              value={videoPlayer}
              label="Video Player Select"
              // @ts-ignore
              onChange={(evt) => setVideoPlayer(evt.target.value)}
              renderValue={(value) => getPlayerIcon(value)}
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
        <Box sx={{ flex: 1 }}>
          <form
            onSubmit={(evt) => {
              evt.preventDefault();
              setVideoIdFromUrl(videoUrl);
            }}
          >
            <Stack direction="row" spacing={1}>
              <TextField
                variant="outlined"
                label={`Enter ${renderPlayerName(videoPlayer)} Link`}
                fullWidth
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                size="small"
              />
              <Button
                disabled={!videoUrl}
                size="medium"
                variant="contained"
                color="secondary"
                type="submit"
              >
                Play
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
      <Typography variant="caption" color="textSecondary" align="center">
        ** Some videos may be unavailable due to copyright **
      </Typography>
    </Stack>
  );
}

export default PlayerActions;
