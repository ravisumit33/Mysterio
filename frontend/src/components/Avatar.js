import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, Icon } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { generateColorFromText } from 'utils';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  // @ts-ignore
  avatar: ({ avatarBg }) => ({
    color: theme.palette.getContrastText(avatarBg),
    backgroundColor: avatarBg,
  }),
}));

export function ImageAvatar(props) {
  const { name, avatarUrl, className, ...rest } = props;

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Avatar className={className} alt={name} src={avatarUrl} {...rest} />;
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
  const { name, className, ...rest } = props;
  const isFirstLetterAlpha = name.charAt(0).match(/[a-zA-Z]/);

  // Get first character & capitalize if it is alphabet
  // otherwise get first unicode character
  // https://stackoverflow.com/a/46159939/6842304
  const txt = isFirstLetterAlpha ? name.charAt(0).toUpperCase() : [...name][0];

  return (
    <Avatar
      className={clsx(useStyles({ avatarBg: generateColorFromText(name) }).avatar, className)}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    >
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
  const { name, avatarUrl, className, avatarProps } = props;
  if (avatarUrl) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ImageAvatar name={name} avatarUrl={avatarUrl} className={className} {...avatarProps} />;
  }
  if (name) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <TextAvatar name={name} className={className} {...avatarProps} />;
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
  avatarProps: PropTypes.shape({}),
};

CustomAvatar.defaultProps = {
  name: '',
  avatarUrl: '',
  className: '',
  avatarProps: {},
};

export default CustomAvatar;
