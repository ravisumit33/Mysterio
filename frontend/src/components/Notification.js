import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Typography } from '@mui/material';
import Animation from 'components/Animation';

function Notification(props) {
  const { animationProps, title, description } = props;

  return (
    <Grid container direction="column" justifyContent="space-between" spacing={1}>
      <Grid item container justifyContent="center" xs={12}>
        <Grid item>
          <Animation
            width={50}
            height={50}
            smallScreenWidth={25}
            smallScreenHeight={25}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...animationProps}
          />
        </Grid>
      </Grid>
      <Grid item container>
        <Grid item xs={12}>
          <Typography variant="h4" align="center">
            {title}
          </Typography>
        </Grid>
      </Grid>
      <Grid item container>
        <Grid item xs={12}>
          <Typography variant="body1" align="center">
            {description}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
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
