import { useCallback } from 'react';
import { PlayerName } from 'appConstants';

const useGetPlayer = (playerRef) => {
  const getPlayerState = useCallback(
    (data) => {
      switch (data.name) {
        case PlayerName.YOUTUBE:
          return playerRef.current.getPlayerState();
        default:
          return -1;
      }
    },
    [playerRef]
  );
  const getPlayerTime = useCallback(
    (data) => {
      switch (data.name) {
        case PlayerName.YOUTUBE:
          return playerRef.current.getCurrentTime();
        default:
          return -1;
      }
    },
    [playerRef]
  );
  return [getPlayerState, getPlayerTime];
};

export default useGetPlayer;
