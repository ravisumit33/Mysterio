import { PlayerName } from 'appConstants';

const useGetPlayer = (playerRef) => {
  const getPlayerState = (data) => {
    switch (data.name) {
      case PlayerName.YOUTUBE:
        return playerRef.current.getPlayerState();
      default:
        return -1;
    }
  };
  const getPlayerTime = (data) => {
    switch (data.name) {
      case PlayerName.YOUTUBE:
        return playerRef.current.getCurrentTime();
      default:
        return -1;
    }
  };
  return { getPlayerState, getPlayerTime };
};

export default useGetPlayer;
