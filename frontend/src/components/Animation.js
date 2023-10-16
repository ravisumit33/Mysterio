import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import lottie from 'lottie-web/build/player/lottie_light';
import { Box, useTheme } from '@mui/material';

function Animation(props) {
  const {
    containerId,
    containerClassName,
    animationData,
    width,
    height,
    smallScreenWidth,
    smallScreenHeight,
    loop,
    autoplay,
  } = props;
  let smWidth = smallScreenWidth;
  let smHeight = smallScreenHeight;
  if (!smWidth) {
    smWidth = width;
  }
  if (!smHeight) {
    smHeight = height;
  }
  const theme = useTheme();
  useEffect(() => {
    lottie.loadAnimation({
      container: document.querySelector(`#${containerId}`),
      animationData,
      loop,
      autoplay,
    });
  }, [animationData, autoplay, containerId, loop]);

  const containerWidth = theme.spacing(width);
  const containerHeight = theme.spacing(height);
  const containerSmallScreenWidth = theme.spacing(smWidth);
  const containerSmallScreenHeight = theme.spacing(smHeight);
  return (
    <Box
      id={containerId}
      className={containerClassName}
      sx={{
        width: {
          xs: containerSmallScreenWidth,
          sm: theme.spacing((width + smWidth) / 2),
          md: containerWidth,
        },
        height: {
          xs: containerSmallScreenHeight,
          sm: theme.spacing((height + smHeight) / 2),
          md: containerHeight,
        },
      }}
    />
  );
}

Animation.propTypes = {
  containerId: PropTypes.string.isRequired,
  containerClassName: PropTypes.string,
  animationData: PropTypes.shape({}).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  smallScreenHeight: PropTypes.number,
  smallScreenWidth: PropTypes.number,
  loop: PropTypes.bool,
  autoplay: PropTypes.bool,
};

Animation.defaultProps = {
  containerClassName: '',
  width: 5,
  height: 5,
  smallScreenWidth: null,
  smallScreenHeight: null,
  loop: true,
  autoplay: true,
};

export default Animation;
