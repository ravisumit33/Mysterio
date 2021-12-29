import React, { useContext, useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import InputAdornment from '@material-ui/core/InputAdornment';
import SendIcon from '@material-ui/icons/Send';
import { Box, IconButton } from '@material-ui/core';
import { ChatWindowStoreContext } from 'contexts';
import { ChatStatus, MessageType } from 'appConstants';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    backgroundColor: 'rgba(0,0,0,0.04)',
    height: theme.spacing(6),
    fontSize: '1rem',
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
  const classes = useStyles();
  const input = useRef(null);
  const [active, setActive] = useState(false);
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const { socket, chatStatus } = chatWindowStore;

  const handleSendMessage = () => {
    const msgTxt = input.current.value;
    if (msgTxt) {
      const message = {
        text: msgTxt,
      };
      socket.send(MessageType.TEXT, message);
      input.current.value = '';
      input.current.focus();
    }
  };

  useEffect(() => {
    chatStatus === ChatStatus.ONGOING ? input.current.focus() : input.current.blur();
  });

  return (
    <Box
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
    >
      <InputBase
        className={clsx(classes.root, { [classes.active]: active })}
        placeholder="Type a message..."
        inputRef={input}
        endAdornment={
          <InputAdornment position="end">
            <IconButton className={classes.icon} onClick={handleSendMessage}>
              <SendIcon />
            </IconButton>
          </InputAdornment>
        }
      />
    </Box>
  );
};

export default InputBar;
