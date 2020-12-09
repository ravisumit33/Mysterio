import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Avatar from 'components/Avatar';
import Typography from '@material-ui/core/Typography';
import { ChatWindowStoreContext, ClassNameContext } from 'contexts';
import { observer } from 'mobx-react-lite';
import { Box } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => {
  const borderRadius = theme.spacing(2.5);
  const avatarSize = theme.spacing(4);
  return {
    avatar: {
      width: avatarSize,
      height: avatarSize,
    },
    rightRow: {
      marginLeft: 'auto',
    },
    msgBox: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(0.5),
    },
    leftMsgBox: {
      textAlign: 'left',
    },
    rightMsgBox: {
      textAlign: 'right',
      flexDirection: 'row-reverse',
    },
    msg: {
      maxWidth: '70%',
      padding: theme.spacing(1, 2),
      borderRadius: theme.spacing(0.5),
      display: 'inline-block',
      wordBreak: 'break-word',
      fontFamily:
        // eslint-disable-next-line max-len
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      fontSize: '0.9rem',
    },
    left: {
      borderTopRightRadius: borderRadius,
      borderBottomRightRadius: borderRadius,
      backgroundColor: theme.palette.grey[100],
    },
    right: {
      borderTopLeftRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
    },
    leftFirst: {
      borderTopLeftRadius: borderRadius,
    },
    leftLast: {
      borderBottomLeftRadius: borderRadius,
    },
    rightFirst: {
      borderTopRightRadius: borderRadius,
    },
    rightLast: {
      borderBottomRightRadius: borderRadius,
    },
  };
});

const ChatMessage = ({ messages, side }) => {
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const { isGroupChat } = chatWindowStore;
  const classes = useStyles();
  const attachClass = (index) => {
    if (index === 0) {
      return classes[`${side}First`];
    }
    if (index === messages.length - 1) {
      return classes[`${side}Last`];
    }
    return '';
  };
  return (
    <Grid container spacing={2} justify={side === 'right' ? 'flex-end' : 'flex-start'}>
      {isGroupChat && side === 'left' && (
        <Grid item>
          <ClassNameContext.Provider value={classes.avatar}>
            <Avatar />
          </ClassNameContext.Provider>
        </Grid>
      )}
      <Grid item xs>
        {messages.map((msg, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Box key={i} className={classes[`${side}Row`]}>
            <Box className={clsx(classes.msgBox, classes[`${side}MsgBox`])}>
              <Typography align="left" className={clsx(classes.msg, classes[side], attachClass(i))}>
                {msg}
              </Typography>
            </Box>
          </Box>
        ))}
      </Grid>
    </Grid>
  );
};

ChatMessage.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.string).isRequired,
  side: PropTypes.oneOf(['left', 'right']),
};
ChatMessage.defaultProps = {
  side: 'left',
};

export default observer(ChatMessage);
