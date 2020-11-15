import React from 'react';
import PropTypes from 'prop-types';
import { ButtonBase, Grid, makeStyles } from '@material-ui/core';
import ButtonText from './ButtonText';
import ButtonIcon from './ButtonIcon';

const useStyles = makeStyles(() => ({
  buttonContainer: {
    padding: '0 0.5rem',
  },
}));

const ButtonWrapper = (props) => {
  const { type, data, onClickHandler, focused } = props;
  const { key } = data;
  const classes = useStyles();
  const handleClick = (event) => {
    event.preventDefault();
    onClickHandler(key);
  };
  const buttonComponent =
    type === 'text' ? (
      <ButtonText text={data.text} focused={focused} />
    ) : (
      <ButtonIcon Icon={data.icon} link={data.link} />
    );

  return (
    <ButtonBase centerRipple>
      <Grid
        className={classes.buttonContainer}
        container
        direction="column"
        onClick={type === 'text' ? handleClick : undefined}
      >
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
    link: PropTypes.string,
  }),
  focused: PropTypes.bool,
  onClickHandler: PropTypes.func.isRequired,
};

ButtonWrapper.defaultProps = {
  data: {},
  focused: false,
};
export default ButtonWrapper;
