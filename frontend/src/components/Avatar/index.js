import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, Icon, makeStyles } from '@material-ui/core';
import { generateRandomColor } from 'utils';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  avatar: (props) => ({
    // @ts-ignore
    color: theme.palette.getContrastText(props.avatarBg),
    // @ts-ignore
    backgroundColor: props.avatarBg,
  }),
}));

const ImageAvatar = (props) => {
  const { store, className } = props;
  return <Avatar className={className} alt={store.name} src={store.avatarUrl} />;
};

ImageAvatar.propTypes = {
  store: PropTypes.shape({
    name: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string.isRequired,
  }).isRequired,
  className: PropTypes.string,
};

ImageAvatar.defaultProps = {
  className: '',
};

const TextAvatar = (props) => {
  const { store, className } = props;
  return (
    <Avatar
      className={clsx(useStyles({ avatarBg: generateRandomColor(store.name) }).avatar, className)}
    >
      {store.name ? store.name.charAt(0).toUpperCase() : '?'}
    </Avatar>
  );
};

TextAvatar.propTypes = {
  store: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
  className: PropTypes.string,
};

TextAvatar.defaultProps = {
  className: '',
};

const CustomAvatar = (props) => {
  const { store, className } = props;
  if (store.avatarUrl) {
    return <ImageAvatar className={className} store={store} />;
  }
  if (store.name) {
    return <TextAvatar className={className} store={store} />;
  }
  return (
    <Avatar className={className}>
      <Icon>person_search</Icon>
    </Avatar>
  );
};

CustomAvatar.propTypes = {
  store: PropTypes.shape({
    name: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
  }).isRequired,
  className: PropTypes.string,
};

CustomAvatar.defaultProps = {
  className: '',
};

export default CustomAvatar;
