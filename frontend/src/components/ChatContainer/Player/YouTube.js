import React from 'react';
import PropTypes from 'prop-types';
import { useConstant } from 'hooks';

const YouTube = (props) => {
  const { videoId, setPlayer, size, onReady, onStateChange, showControls } = props;
  useConstant(() => {
    globalThis.youtubeIframePromise.then(() => {
      const ytPlayer = new globalThis.YT.Player('YouTube', {
        videoId,
        width: 16 * size,
        height: 9.75 * size,
        playerVars: {
          autoplay: 0,
          controls: showControls ? 1 : 0,
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
};

YouTube.propTypes = {
  videoId: PropTypes.string.isRequired,
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
