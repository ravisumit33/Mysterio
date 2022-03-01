import { useCallback } from 'react';
import { PlayerName } from 'appConstants';

const useHandlePlayer = (playerRef) => {
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

  return [handlePlay, handlePause, handleSeek];
};

export default useHandlePlayer;
