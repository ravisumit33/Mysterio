import React from 'react';
import PropTypes from 'prop-types';
import { Box, Grid, Typography, Zoom } from '@material-ui/core';

const ButtonText = (props) => {
  const { text, focused } = props;
  let indicatorWidth = '100%';
  if (!focused) {
    indicatorWidth = '0';
  }
  const indicator = <Box width={indicatorWidth} height={2} bgcolor="red" />;
  return (
    <>
      <Grid item>
        <Box mt={0.5}>
          <Typography variant="body1">{text}</Typography>
        </Box>
      </Grid>
      <Grid item>
        <Zoom in={focused}>{indicator}</Zoom>
      </Grid>
    </>
  );
};

ButtonText.propTypes = {
  text: PropTypes.string.isRequired,
  focused: PropTypes.bool.isRequired,
};

export default ButtonText;
