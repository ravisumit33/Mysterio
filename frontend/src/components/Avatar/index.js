import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, makeStyles } from '@material-ui/core';
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
  const { chatWindowStore, className } = props;
  return (
    <Avatar className={className} alt={chatWindowStore.name} src={chatWindowStore.avatarUrl} />
  );
};

ImageAvatar.propTypes = {
  chatWindowStore: PropTypes.shape({
    name: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string.isRequired,
  }).isRequired,
  className: PropTypes.string,
};

ImageAvatar.defaultProps = {
  className: '',
};

const TextAvatar = (props) => {
  const { chatWindowStore, className } = props;
  return (
    <Avatar
      className={clsx(
        useStyles({ avatarBg: generateRandomColor(chatWindowStore.name) }).avatar,
        className
      )}
    >
      {chatWindowStore.name.charAt(0).toUpperCase()}
    </Avatar>
  );
};

TextAvatar.propTypes = {
  chatWindowStore: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  className: PropTypes.string,
};

TextAvatar.defaultProps = {
  className: '',
};

const CustomAvatar = (props) => {
  const { chatWindowStore, className } = props;

  return chatWindowStore.avatarUrl ? (
    <ImageAvatar className={className} chatWindowStore={chatWindowStore} />
  ) : (
    <TextAvatar className={className} chatWindowStore={chatWindowStore} />
  );
};

CustomAvatar.propTypes = {
  chatWindowStore: PropTypes.shape({
    name: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
  }).isRequired,
  className: PropTypes.string,
};

CustomAvatar.defaultProps = {
  className: '',
};

export default CustomAvatar;
