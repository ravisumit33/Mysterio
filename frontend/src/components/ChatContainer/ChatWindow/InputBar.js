import React, { useContext, useEffect, useRef, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
import SendIcon from '@mui/icons-material/Send';
import { IconButton } from '@mui/material';
import { ChatWindowStoreContext } from 'contexts';
import { ChatStatus, MessageType } from 'appConstants';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    backgroundColor: alpha(theme.palette.common.black, 0.04),
    minHeight: theme.spacing(6),
    fontSize: '1rem',
    width: '100%',
    transition: 'background-color .2s ease,box-shadow .2s ease',
    boxShadow: '0px -5px 20px 0px rgba(0, 0, 0, 0.1)',
  },
  active: {
    backgroundColor: theme.palette.common.white,
    boxShadow: '0px -5px 20px 0px rgba(0, 0, 0, 0.2)',
  },
  adornment: {
    alignSelf: 'end',
    marginBottom: theme.spacing(2.25),
  },
}));

function InputBar() {
  const classes = useStyles();
  const input = useRef(null);
  const focusInputTimeoutRef = useRef(null);
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
    let cleanup;
    if (chatStatus === ChatStatus.ONGOING) {
      focusInputTimeoutRef.current = setTimeout(() => input.current.focus(), 500);
      cleanup = () => clearTimeout(focusInputTimeoutRef.current);
    }
    return cleanup;
  }, [chatStatus]);

  return (
    <form
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      onSubmit={(evt) => {
        evt.preventDefault();
        handleSendMessage();
      }}
    >
      <InputBase
        className={clsx(classes.root, { [classes.active]: active })}
        disabled={!(chatStatus === ChatStatus.ONGOING)}
        placeholder="Type a message..."
        inputRef={input}
        multiline
        maxRows={10}
        endAdornment={
          <InputAdornment position="end" className={classes.adornment}>
            <IconButton type="submit" disabled={!(chatStatus === ChatStatus.ONGOING)} size="large">
              <SendIcon />
            </IconButton>
          </InputAdornment>
        }
        onKeyPress={(evt) => {
          if (evt.which === 13 && !evt.shiftKey) {
            evt.preventDefault();
            handleSendMessage();
          }
        }}
      />
    </form>
  );
}

export default InputBar;
