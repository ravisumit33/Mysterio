import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  buttonContainer: {
    paddingLeft: theme.spacing(2),
  },
  buttonCommon: {
    color: 'inherit',
  },
  buttonText: {
    borderRadius: 0,
    backgroundColor: 'transparent !important',
  },
  buttonBoxText: {
    boxShadow: `0px 0px 0px 0px ${theme.palette.secondary.main}`,
    transition: theme.transitions.create('box-shadow', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.short,
    }),
    '&.focused, &:hover': {
      boxShadow: `0px 2px 0px 0px ${theme.palette.secondary.main}`,
    },
  },
}));

function CustomButton(props) {
  const { type, data, onClickHandler, focused, isHamburgerMenu } = props;
  const { key } = data;
  const classes = useStyles();
  const handleClick = () => {
    onClickHandler(key);
  };
  const { icon } = data;
  const disableRipple = isHamburgerMenu;
  let buttonComponent;
  if (type === 'text') {
    buttonComponent = (
      <Button
        size="small"
        onClick={data.action}
        className={clsx(classes.buttonCommon, classes.buttonText)}
        disableRipple={disableRipple}
      >
        <Box className={clsx(classes.buttonBoxText, { focused })}>{data.text}</Box>
      </Button>
    );
  } else {
    const commonIconBtnProps = {
      onClick: data.action,
      disableRipple,
    };
    buttonComponent = isHamburgerMenu ? (
      <Button
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...commonIconBtnProps}
        className={clsx(classes.buttonCommon, classes.buttonText)}
        endIcon={icon}
        size="small"
      >
        {data.text}
      </Button>
    ) : (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <IconButton {...commonIconBtnProps} className={classes.buttonCommon} size="small">
        <Tooltip title={data.text} arrow>
          {/* Need to wrap icon component in Box for tooltip to support functional components. */}
          {/* https://stackoverflow.com/a/57528471/6842304  */}
          <Box>{icon}</Box>
        </Tooltip>
      </IconButton>
    );
  }
  return (
    <Box
      className={clsx({ [classes.buttonContainer]: !isHamburgerMenu })}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...(type === 'text' && { onClick: handleClick })}
    >
      {buttonComponent}
    </Box>
  );
}

CustomButton.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.shape({
    key: PropTypes.string.isRequired,
    text: PropTypes.string,
    icon: PropTypes.element,
    action: PropTypes.func,
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
