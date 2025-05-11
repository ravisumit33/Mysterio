import React from 'react';
import { alpha, Tooltip, IconButton, Badge } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { KeyboardDoubleArrowDown } from '@mui/icons-material';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
  bottomButton: {
    color: theme.palette.common.black,
    backgroundColor: alpha(theme.palette.common.white, 0.8),
    borderRadius: '50%',
  },
}));

function BottomButton({ scrollToBottom, unreadMessagesCount }) {
  const classes = useStyles();
  return (
    <Tooltip title="Go to bottom" arrow>
      <IconButton
        onClick={() => scrollToBottom()}
        sx={{ float: 'right', transform: 'translate(-0.25rem, -3.5rem)' }}
        size="large"
      >
        <Badge color="secondary" badgeContent={unreadMessagesCount}>
          <span className={classes.bottomButton}>
            <KeyboardDoubleArrowDown fontSize="large" sx={{ verticalAlign: 'middle' }} />
          </span>
        </Badge>
      </IconButton>
    </Tooltip>
  );
}

BottomButton.propTypes = {
  scrollToBottom: PropTypes.func.isRequired,
  unreadMessagesCount: PropTypes.number,
};

BottomButton.defaultProps = {
  unreadMessagesCount: 0,
};

export default BottomButton;
