import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  buttonBoxText: {
    boxShadow: `0px 0px 0px 0px ${theme.palette.secondary.main}`,
    transition: theme.transitions.create('box-shadow', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.short,
    }),
    '&.focused': {
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
    data.action();
  };
  const { icon, buttonProps } = data;
  let buttonComponent = null;
  if (isHamburgerMenu) {
    buttonComponent = (
      <MenuItem onClick={handleClick}>
        <ListItemText>
          <Box component="span" className={clsx(classes.buttonBoxText, { focused })}>
            {data.text}
          </Box>
        </ListItemText>
        <ListItemIcon>{icon}</ListItemIcon>
      </MenuItem>
    );
  } else if (type === 'text') {
    buttonComponent = (
      <Button
        size="small"
        onClick={handleClick}
        color="inherit"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...buttonProps}
      >
        <Box component="span" className={clsx(classes.buttonBoxText, { focused })}>
          {data.text}
        </Box>
      </Button>
    );
  } else {
    buttonComponent = (
      <Tooltip title={data.text} arrow>
        <IconButton
          onClick={handleClick}
          size="small"
          color="inherit"
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...buttonProps}
        >
          {icon}
        </IconButton>
      </Tooltip>
    );
  }
  return buttonComponent;
}

CustomButton.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.shape({
    key: PropTypes.string.isRequired,
    text: PropTypes.string,
    icon: PropTypes.element,
    action: PropTypes.func,
    buttonProps: PropTypes.shape({
      variant: PropTypes.string,
      color: PropTypes.string,
    }),
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
