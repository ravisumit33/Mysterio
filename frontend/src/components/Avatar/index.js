import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Icon, makeStyles } from '@material-ui/core';
import { generateRandomColor } from 'utils';
import clsx from 'clsx';
import { ChatWindowStoreContext, ClassNameContext } from 'contexts';

const useStyles = makeStyles((theme) => ({
  avatar: (props) => ({
    // @ts-ignore
    color: theme.palette.getContrastText(props.avatarBg),
    // @ts-ignore
    backgroundColor: props.avatarBg,
  }),
}));

export const ImageAvatar = (props) => {
  const { name, avatarUrl, className } = props;

  return <Avatar className={className} alt={name} src={avatarUrl} />;
};

ImageAvatar.propTypes = {
  name: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string.isRequired,
  className: PropTypes.string,
};

ImageAvatar.defaultProps = {
  className: '',
};

export const TextAvatar = (props) => {
  const { name, className } = props;

  return (
    <Avatar className={clsx(useStyles({ avatarBg: generateRandomColor(name) }).avatar, className)}>
      {name ? name.charAt(0).toUpperCase() : '?'}
    </Avatar>
  );
};

TextAvatar.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
};

TextAvatar.defaultProps = {
  className: '',
};

const CustomAvatar = (props) => {
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const className = useContext(ClassNameContext);
  if (chatWindowStore.avatarUrl) {
    return (
      <ImageAvatar
        name={chatWindowStore.name}
        avatarUrl={chatWindowStore.avatarUrl}
        className={className}
      />
    );
  }
  if (chatWindowStore.name) {
    return <TextAvatar name={chatWindowStore.name} />;
  }
  return (
    <Avatar className={className}>
      <Icon>person_search</Icon>
    </Avatar>
  );
};

export default CustomAvatar;
