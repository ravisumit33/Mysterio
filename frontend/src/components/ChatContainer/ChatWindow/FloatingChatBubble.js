import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@mui/styles';
import { Box, Button, Badge } from '@mui/material';
import { ChatBubble } from '@mui/icons-material';

const useStyles = makeStyles((theme) => ({
  floatingChatBubble: {
    position: 'fixed',
    right: theme.spacing(2),
    bottom: theme.spacing(2),
    zIndex: 1000,
    '& .MuiBadge-badge': {
      right: -3,
      top: 13,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
    },
  },
  chatBubbleButton: {
    width: theme.spacing(7),
    height: theme.spacing(7),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

function FloatingChatBubble({ onClick, shouldShow, hasNewMessage }) {
  const [newMessageCount, setNewMessageCount] = useState(0);

  useEffect(() => {
    if (hasNewMessage) {
      setNewMessageCount((prevCnt) => prevCnt + 1);
    }
  }, [hasNewMessage]);

  const handleClick = () => {
    onClick();
    setNewMessageCount(0);
  };
  const classes = useStyles();
  return (
    <Box className={classes.floatingChatBubble} sx={{ display: shouldShow ? 'block' : 'none' }}>
      <Button
        className={classes.chatBubbleButton}
        onClick={handleClick}
        variant="contained"
        color="primary"
      >
        <Badge badgeContent={newMessageCount} color="error">
          <ChatBubble />
        </Badge>
      </Button>
    </Box>
  );
}

FloatingChatBubble.propTypes = {
  onClick: PropTypes.func.isRequired,
  shouldShow: PropTypes.bool,
  hasNewMessage: PropTypes.bool,
};

FloatingChatBubble.defaultProps = {
  shouldShow: false,
  hasNewMessage: false,
};

export default FloatingChatBubble;
