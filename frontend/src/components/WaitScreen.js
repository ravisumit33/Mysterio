import React from 'react';
import PropTypes from 'prop-types';
import { Backdrop, Box, CircularProgress, makeStyles, Typography } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    color: theme.palette.common.white,
  },
}));

function WaitScreen(props) {
  const { waitScreenText, shouldOpen, className, progressComponent } = props;
  const classes = useStyles();
  return (
    <Backdrop className={clsx(classes.backdrop, className)} open={shouldOpen}>
      <Typography variant="body1">{waitScreenText}</Typography>
      {progressComponent}
    </Backdrop>
  );
}

WaitScreen.propTypes = {
  shouldOpen: PropTypes.bool.isRequired,
  className: PropTypes.string,
  progressComponent: PropTypes.node,
  waitScreenText: PropTypes.string,
};

WaitScreen.defaultProps = {
  className: '',
  progressComponent: (
    <Box ml={2}>
      <CircularProgress color="inherit" />
    </Box>
  ),
  waitScreenText: 'Please wait',
};

export default WaitScreen;
