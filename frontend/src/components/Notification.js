import React from 'react';
import PropTypes from 'prop-types';
import { Stack, Typography } from '@mui/material';
import Animation from 'components/Animation';

function Notification(props) {
  const { animationProps, title, description } = props;

  return (
    <Stack justifyContent="space-between" alignItems="center" spacing={1}>
      <Animation
        width={50}
        height={50}
        smallScreenWidth={25}
        smallScreenHeight={25}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...animationProps}
      />
      <Typography variant="h4" align="center">
        {title}
      </Typography>
      <Typography variant="body1" align="center">
        {description}
      </Typography>
    </Stack>
  );
}

Notification.propTypes = {
  animationProps: PropTypes.shape({
    containerId: PropTypes.string.isRequired,
    containerClassName: PropTypes.string,
    animationData: PropTypes.shape({}).isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
  }).isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default Notification;
