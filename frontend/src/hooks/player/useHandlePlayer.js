import { PlayerName } from 'appConstants';
import { useCallback } from 'react';

const useHandlePlayer = (playerRef) => {
  const handleCue = useCallback(
    (data) => {
      switch (data.name) {
        case PlayerName.YOUTUBE: {
          playerRef.current.cueVideoById({
            videoId: data.video_id,
            startSeconds: data.current_time,
          });
          break;
        }
        default:
          break;
      }
    },
    [playerRef]
  );

  const handlePlay = useCallback(
    (data) => {
      switch (data.name) {
        case PlayerName.YOUTUBE: {
          playerRef.current.playVideo();
          break;
        }
        default:
          break;
      }
    },
    [playerRef]
  );

  const handlePause = useCallback(
    (data) => {
      switch (data.name) {
        case PlayerName.YOUTUBE: {
          playerRef.current.pauseVideo();
          break;
        }
        default:
          break;
      }
    },
    [playerRef]
  );

  const handleSeek = useCallback(
    (data) => {
      switch (data.name) {
        case PlayerName.YOUTUBE: {
          playerRef.current.seekTo(data.current_time);
          break;
        }
        default:
          break;
      }
    },
    [playerRef]
  );

  return { handleCue, handlePlay, handlePause, handleSeek };
};

export default useHandlePlayer;
