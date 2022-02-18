import React from 'react';
import PropTypes from 'prop-types';
import { useConstant } from 'hooks';
import { isDevEnv } from 'utils';
import { MysterioOrigin } from 'appConstants';

function YouTube(props) {
  const { setPlayer, size, onReady, onStateChange, showControls } = props;
  useConstant(() => {
    globalThis.youtubeIframePromise.then(() => {
      const ytPlayer = new globalThis.YT.Player('YouTube', {
        width: 16 * size,
        height: 9.75 * size,
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
      setPlayer(ytPlayer);
    });
  });

  return <div id="YouTube" />;
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
