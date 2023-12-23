import { PlayerName } from 'appConstants';
import { useCallback } from 'react';
import { getVideoIdFromUrl } from 'utils';

const useGetPlayer = (playerRef) => {
  const getPlayerState = useCallback(
    (playerName) => {
      switch (playerName) {
        case PlayerName.YOUTUBE:
          return playerRef.current.getPlayerState();
        default:
          return -1;
      }
    },
    [playerRef]
  );
  const getPlayerTime = useCallback(
    (playerName) => {
      switch (playerName) {
        case PlayerName.YOUTUBE:
          return playerRef.current.getCurrentTime();
        default:
          return -1;
      }
    },
    [playerRef]
  );

  const getPlayerId = useCallback(
    (playerName) => {
      switch (playerName) {
        case PlayerName.YOUTUBE:
          return getVideoIdFromUrl(playerRef.current.getVideoUrl(), playerName);
        default:
          return -1;
      }
    },
    [playerRef]
  );
  return { getPlayerState, getPlayerTime, getPlayerId };
};

export default useGetPlayer;
