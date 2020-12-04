import React from 'react';
import PropTypes from 'prop-types';
import cx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Avatar from 'components/Avatar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import TagFaces from '@material-ui/icons/TagFaces';
import Reply from '@material-ui/icons/Reply';
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import { ClassNameContext } from 'contexts';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles(({ palette, spacing }) => {
  const radius = spacing(2.5);
  const size = 30;
  const rightBgColor = palette.primary.main;
  // if you want the same as facebook messenger, use this color '#09f'
  return {
    avatar: {
      width: size,
      height: size,
    },
    rightRow: {
      marginLeft: 'auto',
    },
    msgBox: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: 4,
      '&:hover $iconBtn': {
        opacity: 1,
      },
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
      padding: spacing(1, 2),
      borderRadius: 4,
      display: 'inline-block',
      wordBreak: 'break-word',
      fontFamily:
        // eslint-disable-next-line max-len
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      fontSize: '14px',
    },
    left: {
      borderTopRightRadius: radius,
      borderBottomRightRadius: radius,
      backgroundColor: palette.grey[100],
    },
    right: {
      borderTopLeftRadius: radius,
      borderBottomLeftRadius: radius,
      backgroundColor: rightBgColor,
      color: palette.common.white,
    },
    leftFirst: {
      borderTopLeftRadius: radius,
    },
    leftLast: {
      borderBottomLeftRadius: radius,
    },
    rightFirst: {
      borderTopRightRadius: radius,
    },
    rightLast: {
      borderBottomRightRadius: radius,
    },
    iconBtn: {
      opacity: 0,
      padding: 6,
      color: 'rgba(0,0,0,0.34)',
      '&:hover': {
        color: 'rgba(0,0,0,0.87)',
      },
      margin: '0 4px',
      '& svg': {
        fontSize: 20,
      },
    },
    image: {
      maxWidth: 120,
      maxHeight: 120,
    },
  };
});

const ChatMessage = ({ messages, side }) => {
  const styles = useStyles();
  const attachClass = (index) => {
    if (index === 0) {
      return styles[`${side}First`];
    }
    if (index === messages.length - 1) {
      return styles[`${side}Last`];
    }
    return '';
  };
  return (
    <Grid container spacing={2} justify={side === 'right' ? 'flex-end' : 'flex-start'}>
      {side === 'left' && (
        <Grid item>
          <ClassNameContext.Provider value={styles.avatar}>
            <Avatar />
          </ClassNameContext.Provider>
        </Grid>
      )}
      <Grid item xs>
        {messages.map((msg, i) => {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <div key={msg.id || i} className={cx(styles[`${side}Row`])}>
              <div className={cx(styles.msgBox, styles[`${side}MsgBox`])}>
                {typeof msg === 'string' && (
                  <Typography align="left" className={cx(styles.msg, styles[side], attachClass(i))}>
                    {msg}
                  </Typography>
                )}
                {typeof msg === 'object' && msg.type === 'image' && (
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  <img className={styles.image} alt={msg.alt} {...msg} />
                )}
                <IconButton className={styles.iconBtn}>
                  <TagFaces />
                </IconButton>
                <IconButton className={styles.iconBtn}>
                  <Reply />
                </IconButton>
                <IconButton className={styles.iconBtn}>
                  <MoreHoriz />
                </IconButton>
              </div>
            </div>
          );
        })}
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
