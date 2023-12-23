import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { useConstant } from 'hooks';
import { isDevEnv } from 'utils';
import { MysterioOrigin } from 'appConstants';

function YouTube(props) {
  const { setPlayer, size, onReady, onStateChange, showControls } = props;
  const ytPlayerRef = useRef(null);

  useEffect(() => () => ytPlayerRef.current && ytPlayerRef.current.destroy(), []);
  useConstant(() => {
    globalThis.youtubeIframePromise.then(() => {
      const ytPlayer = new globalThis.YT.Player('YouTube', {
        width: 16 * size,
        height: 9 * size,
        playerVars: {
          autoplay: 0,
          controls: showControls ? 1 : 0,
          origin: isDevEnv() ? 'http://localhost:3000' : MysterioOrigin,
        },
        events: {
          onReady,
          onStateChange,
        },
      });
      ytPlayerRef.current = ytPlayer;
      setPlayer(ytPlayer);
    });
  });

  return (
    // Wrapper box https://stackoverflow.com/q/54880669/6842304
    <Box>
      <Box id="YouTube" sx={{ pointerEvents: showControls ? 'auto' : 'none' }} />
    </Box>
  );
}

YouTube.propTypes = {
  setPlayer: PropTypes.func.isRequired,
  size: PropTypes.number,
  onReady: PropTypes.func,
  onStateChange: PropTypes.func,
  showControls: PropTypes.bool,
};

YouTube.defaultProps = {
  size: 50,
  onReady: () => {},
  onStateChange: () => {},
  showControls: true,
};

export default YouTube;
