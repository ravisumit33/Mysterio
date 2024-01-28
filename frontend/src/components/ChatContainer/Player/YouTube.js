import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useConstant } from 'hooks';
import { isDevEnv } from 'utils';
import { MysterioOrigin } from 'appConstants';

const useStyles = makeStyles(() => ({
  // https://css-tricks.com/fluid-width-video/
  wrapper: {
    position: 'relative',
    paddingBottom: '56.25%' /* 16:9 */,
    height: 0,
    '& iframe': {
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
    },
  },
}));

function YouTube(props) {
  const { setPlayer, onReady, onStateChange, showControls } = props;
  const ytPlayerRef = useRef(null);
  const classes = useStyles();

  useEffect(() => () => ytPlayerRef.current && ytPlayerRef.current.destroy(), []);
  useConstant(() => {
    globalThis.youtubeIframePromise.then(() => {
      const ytPlayer = new globalThis.YT.Player('YouTube', {
        playerVars: {
          autoplay: 0,
          controls: showControls ? 1 : 0,
          origin: isDevEnv() ? 'http://localhost:3000' : MysterioOrigin,
          playsinline: 1,
          fs: 0,
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
    <Box className={classes.wrapper}>
      <Box id="YouTube" />
    </Box>
  );
}

YouTube.propTypes = {
  setPlayer: PropTypes.func.isRequired,
  onReady: PropTypes.func,
  onStateChange: PropTypes.func,
  showControls: PropTypes.bool,
};

YouTube.defaultProps = {
  onReady: () => {},
  onStateChange: () => {},
  showControls: true,
};

export default YouTube;
