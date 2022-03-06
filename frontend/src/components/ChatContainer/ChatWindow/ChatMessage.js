import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Avatar from 'components/Avatar';
import Typography from '@material-ui/core/Typography';
import { ChatWindowStoreContext } from 'contexts';
import { observer } from 'mobx-react-lite';
import { Box } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => {
  const borderRadius = theme.spacing(2.5);
  const avatarSize = theme.spacing(5);
  return {
    avatar: {
      width: avatarSize,
      height: avatarSize,
    },
    avatarContainer: {
      padding: theme.spacing(0.5, 1, 0.5, 0),
      width: theme.spacing(6), // avatarSize + paddingRight
    },
    rightRow: {
      marginLeft: 'auto',
    },
    msgBox: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0.5, 0),
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
      color: theme.palette.primary.contrastText,
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

function ChatMessage({ message, sender, side, first, last }) {
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const { isGroupChat } = chatWindowStore;
  const classes = useStyles();
  return (
    <Grid container justifyContent={side === 'right' ? 'flex-end' : 'flex-start'}>
      {isGroupChat && side === 'left' && (
        <Grid item className={classes.avatarContainer}>
          {first && (
            <Avatar
              name={(sender && sender.name) || '?'}
              avatarUrl={sender && sender.avatarUrl}
              className={classes.avatar}
            />
          )}
        </Grid>
      )}
      <Grid item xs>
        <Box className={classes[`${side}Row`]}>
          <Box className={clsx(classes.msgBox, classes[`${side}MsgBox`])}>
            <Typography
              align="left"
              className={clsx(classes.msg, classes[side], {
                [classes[`${side}First`]]: first,
                [classes[`${side}Last`]]: last,
              })}
              component="pre"
            >
              {message.trim()}
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

ChatMessage.propTypes = {
  message: PropTypes.string.isRequired,
  side: PropTypes.oneOf(['left', 'right']),
  sender: PropTypes.shape({
    name: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
  }).isRequired,
  first: PropTypes.bool,
  last: PropTypes.bool,
};
ChatMessage.defaultProps = {
  side: 'left',
  first: false,
  last: false,
};

export default observer(ChatMessage);
