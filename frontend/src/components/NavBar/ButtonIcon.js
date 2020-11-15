import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from '@material-ui/core';

const ButtonIcon = ({ Icon }) => {
  return (
    <Grid item>
      <Icon />
    </Grid>
  );
};

ButtonIcon.propTypes = {
  Icon: PropTypes.elementType.isRequired,
};

export default ButtonIcon;
