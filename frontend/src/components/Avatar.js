import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, Icon, makeStyles } from '@material-ui/core';
import { generateRandomColor } from 'utils';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  // @ts-ignore
  avatar: ({ avatarBg }) => ({
    color: theme.palette.getContrastText(avatarBg),
    backgroundColor: avatarBg,
  }),
}));

export function ImageAvatar(props) {
  const { name, avatarUrl, className } = props;

  return <Avatar className={className} alt={name} src={avatarUrl} />;
}

ImageAvatar.propTypes = {
  name: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string.isRequired,
  className: PropTypes.string,
};

ImageAvatar.defaultProps = {
  className: '',
};

export function TextAvatar(props) {
  const { name, className } = props;
  const isFirstLetterAlpha = name.charAt(0).match(/[a-zA-Z]/);

  // Get first character & capitalize if it is alphabet
  // otherwise get first unicode character
  // https://stackoverflow.com/a/46159939/6842304
  const txt = isFirstLetterAlpha ? name.charAt(0).toUpperCase() : [...name][0];

  return (
    <Avatar className={clsx(useStyles({ avatarBg: generateRandomColor(name) }).avatar, className)}>
      {txt}
    </Avatar>
  );
}

TextAvatar.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
};

TextAvatar.defaultProps = {
  className: '',
};

function CustomAvatar(props) {
  const { name, avatarUrl, className } = props;
  if (avatarUrl) {
    return <ImageAvatar name={name} avatarUrl={avatarUrl} className={className} />;
  }
  if (name) {
    return <TextAvatar name={name} className={className} />;
  }
  return (
    <Avatar>
      <Icon>person_search</Icon>
    </Avatar>
  );
}

CustomAvatar.propTypes = {
  name: PropTypes.string,
  avatarUrl: PropTypes.string,
  className: PropTypes.string,
};

CustomAvatar.defaultProps = {
  name: '',
  avatarUrl: '',
  className: '',
};

export default CustomAvatar;
