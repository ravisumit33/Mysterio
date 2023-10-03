import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Icon, Stack, SvgIcon, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyle = makeStyles((theme) => ({
  root: {
    width: 'auto',
    heiht: theme.spacing(37),
    [theme.breakpoints.up('xs')]: {
      width: theme.spacing(30),
    },
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(50),
    },
    paddingBottom: theme.spacing(5),
  },
  avatar: {
    width: theme.spacing(11),
    height: theme.spacing(11),
    margin: '0 auto',
    fontSize: theme.spacing(11 / 2),
    backgroundColor: '#38d2d9',
  },
  avatarIcon: {
    width: '50%',
    height: '50%',
    fontSize: '100%',
  },
}));
function Card(props) {
  const classes = useStyle();
  const { icon, title, description, isLocalIcon } = props;
  return (
    <Box className={classes.root}>
      <Stack spacing={3}>
        <Avatar alt={title} className={classes.avatar}>
          {isLocalIcon && (
            <SvgIcon className={classes.avatarIcon} component={icon} viewBox="0 0 512 512" />
          )}
          {!isLocalIcon && <Icon className={classes.avatarIcon}>{icon}</Icon>}
        </Avatar>
        <Typography variant="h6" align="center">
          {title}
        </Typography>
        <Typography variant="body2" align="center">
          {description}
        </Typography>
      </Stack>
    </Box>
  );
}

Card.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  icon: PropTypes.any,
  title: PropTypes.string,
  description: PropTypes.string,
  isLocalIcon: PropTypes.bool,
};

Card.defaultProps = {
  icon: '',
  title: '',
  description: '',
  isLocalIcon: false,
};

export default Card;
