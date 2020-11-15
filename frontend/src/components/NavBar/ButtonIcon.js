import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Link } from '@material-ui/core';

const ButtonIcon = ({ Icon, link }) => {
  return (
    <Grid item container alignItems="center">
      <Link href={link} target="_blank" rel="noopener" color="inherit">
        <Icon />
      </Link>
    </Grid>
  );
};

ButtonIcon.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  link: PropTypes.string,
};

ButtonIcon.defaultProps = {
  link: '',
};

export default ButtonIcon;
