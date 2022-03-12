import React, { useContext, useEffect, useRef, useState } from 'react';
import { alpha, makeStyles } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import InputAdornment from '@material-ui/core/InputAdornment';
import SendIcon from '@material-ui/icons/Send';
import { IconButton } from '@material-ui/core';
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
  },
  active: {
    backgroundColor: 'white',
    boxShadow: '0px -5px 20px 0px rgba(150, 165, 190, 0.2)',
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
        content: msgTxt,
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
            <IconButton type="submit" disabled={!(chatStatus === ChatStatus.ONGOING)}>
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
