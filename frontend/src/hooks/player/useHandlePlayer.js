import { PlayerName } from 'appConstants';

const useHandlePlayer = (playerRef) => {
  const handlePlay = (data) => {
    switch (data.name) {
      case PlayerName.YOUTUBE: {
        playerRef.current.playVideo();
        break;
      }
      default:
        break;
    }
  };

  const handlePause = (data) => {
    switch (data.name) {
      case PlayerName.YOUTUBE: {
        playerRef.current.pauseVideo();
        break;
      }
      default:
        break;
    }
  };

  const handleSeek = (data) => {
    switch (data.name) {
      case PlayerName.YOUTUBE: {
        playerRef.current.seekTo(data.current_time);
        break;
      }
      default:
        break;
    }
  };

  return { handlePlay, handlePause, handleSeek };
};

export default useHandlePlayer;
