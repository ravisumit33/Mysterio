import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Grid, IconButton, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  buttonContainer: {
    paddingLeft: '0.5rem',
  },
  buttonCommon: {
    borderRadius: 0,
    backgroundColor: 'transparent !important',
    color: 'inherit',
  },
  buttonText: {
    boxShadow: '0px 0px 0px 0px red',
    transition: 'box-shadow 0.12s linear',
    '&.focused, &:hover': {
      boxShadow: '0px 2px 0px 0px red',
    },
  },
}));

const CustomButton = (props) => {
  const { type, data, onClickHandler, focused, isHamburgerMenu } = props;
  const { key } = data;
  const classes = useStyles();
  const handleClick = () => {
    onClickHandler(key);
  };
  const IconComponent = data.icon;
  const disableRipple = isHamburgerMenu;
  let buttonComponent = <></>;
  if (type === 'text') {
    buttonComponent = (
      <Button
        size="small"
        href={data.href}
        className={classes.buttonCommon}
        disableRipple={disableRipple}
      >
        <Box className={`${classes.buttonText} ${focused ? 'focused' : ''}`}>{data.text}</Box>
      </Button>
    );
  } else {
    const commonIconBtnProps = {
      className: classes.buttonCommon,
      href: data.href,
      target: '_blank',
      rel: 'noopener',
      disableRipple,
    };
    buttonComponent = isHamburgerMenu ? (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Button {...commonIconBtnProps} endIcon={<IconComponent />}>
        {data.text}
      </Button>
    ) : (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <IconButton {...commonIconBtnProps}>
        <IconComponent />
      </IconButton>
    );
  }
  return (
    <Box width="100%">
      <Grid
        className={!isHamburgerMenu ? classes.buttonContainer : undefined}
        container
        direction="column"
        onClick={type === 'text' ? handleClick : undefined}
      >
        {buttonComponent}
      </Grid>
    </Box>
  );
};

CustomButton.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.shape({
    key: PropTypes.string.isRequired,
    text: PropTypes.string,
    icon: PropTypes.elementType,
    href: PropTypes.string,
  }),
  focused: PropTypes.bool,
  onClickHandler: PropTypes.func.isRequired,
  isHamburgerMenu: PropTypes.bool,
};

CustomButton.defaultProps = {
  data: {},
  focused: false,
  isHamburgerMenu: false,
};

export default CustomButton;
