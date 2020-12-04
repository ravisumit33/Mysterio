import React, { useContext, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import InputAdornment from '@material-ui/core/InputAdornment';
import SendIcon from '@material-ui/icons/Send';
import { Box, IconButton } from '@material-ui/core';
import log from 'loglevel';
import { ChatWindowStoreContext } from 'contexts';
import MessageType from 'constants.js';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: 16,
    backgroundColor: 'rgba(0,0,0,0.04)',
    height: 36,
    fontSize: 13,
    width: '100%',
    transition: 'background-color .2s ease,box-shadow .2s ease',
  },
  active: {
    backgroundColor: 'white',
    boxShadow: '0px -5px 20px 0px rgba(150, 165, 190, 0.2)',
  },
  icon: {
    height: theme.spacing(4),
    width: theme.spacing(4),
    marginRight: theme.spacing(1),
  },
}));

const InputBar = () => {
  const styles = useStyles();
  const input = useRef(null);
  const [active, setActive] = useState(false);
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const { socket } = chatWindowStore;

  const handleSendMessage = () => {
    const msgTxt = input.current.value;
    log.warn(msgTxt);
    if (msgTxt) {
      const message = {
        text: msgTxt,
      };
      socket.send(MessageType.TEXT, message);
      input.current.value = '';
    }
  };

  return (
    <Box onFocus={() => setActive(true)} onBlur={() => setActive(false)}>
      <InputBase
        className={clsx(styles.root, { [styles.active]: active })}
        placeholder="Type a message..."
        inputRef={input}
        endAdornment={
          <InputAdornment position="end">
            <IconButton className={styles.icon} onClick={handleSendMessage}>
              <SendIcon />
            </IconButton>
          </InputAdornment>
        }
      />
    </Box>
  );
};

export default observer(InputBar);
