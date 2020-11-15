import React from 'react';
import PropTypes from 'prop-types';
import { ButtonBase, Grid, makeStyles } from '@material-ui/core';
import ButtonText from './ButtonText';
import ButtonIcon from './ButtonIcon';

const PREFIX = '[components/NavBar/ButtonWrapper]';
const DEBUG = true;

const useStyles = makeStyles(() => ({
  buttonContainer: {
    padding: '0.5rem',
  },
}));

const ButtonWrapper = (props) => {
  const { type, data, onClickHandler, focused } = props;
  const { key } = data;
  const classes = useStyles();
  const handleClick = (event) => {
    event.preventDefault();
    if (DEBUG) console.log(PREFIX, 'handleClick', event, key);
    onClickHandler(key);
  };
  const buttonComponent =
    type === 'text' ? (
      <ButtonText text={data.text} focused={focused} />
    ) : (
      <ButtonIcon Icon={data.icon} />
    );

  return (
    <ButtonBase centerRipple>
      <Grid className={classes.buttonContainer} container direction="column" onClick={handleClick}>
        {buttonComponent}
      </Grid>
    </ButtonBase>
  );
};

ButtonWrapper.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.shape({
    key: PropTypes.string.isRequired,
    text: PropTypes.string,
    icon: PropTypes.elementType,
  }),
  focused: PropTypes.bool,
  onClickHandler: PropTypes.func.isRequired,
};

ButtonWrapper.defaultProps = {
  data: {
    text: '',
  },
  focused: false,
};
export default ButtonWrapper;
