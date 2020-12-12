import React, { useContext } from 'react';
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

const ImageAvatar = (props) => {
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const className = useContext(ClassNameContext);

  return (
    <Avatar className={className} alt={chatWindowStore.name} src={chatWindowStore.avatarUrl} />
  );
};

const TextAvatar = (props) => {
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const className = useContext(ClassNameContext);

  return (
    <Avatar
      className={clsx(
        useStyles({ avatarBg: generateRandomColor(chatWindowStore.name) }).avatar,
        className
      )}
    >
      {chatWindowStore.name ? chatWindowStore.name.charAt(0).toUpperCase() : '?'}
    </Avatar>
  );
};

const CustomAvatar = (props) => {
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const className = useContext(ClassNameContext);
  if (chatWindowStore.avatarUrl) {
    return <ImageAvatar />;
  }
  if (chatWindowStore.name) {
    return <TextAvatar />;
  }
  return (
    <Avatar className={className}>
      <Icon>person_search</Icon>
    </Avatar>
  );
};

export default CustomAvatar;
