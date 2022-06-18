import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import lottie from 'lottie-web/build/player/lottie_light';
import { Box, useMediaQuery, useTheme } from '@material-ui/core';

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
  const theme = useTheme();
  // @ts-ignore
  const isSmallScreen = useMediaQuery((tm) => tm.breakpoints.down('sm'));
  useEffect(() => {
    lottie.loadAnimation({
      container: document.querySelector(`#${containerId}`),
      animationData,
      loop,
      autoplay,
    });
  }, [animationData, autoplay, containerId, loop]);

  let containerWidth = theme.spacing(width);
  let containerHeight = theme.spacing(height);
  if (isSmallScreen) {
    smallScreenWidth && (containerWidth = theme.spacing(smallScreenWidth));
    smallScreenHeight && (containerHeight = theme.spacing(smallScreenHeight));
  }
  return (
    <Box
      id={containerId}
      width={containerWidth}
      height={containerHeight}
      className={containerClassName}
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
