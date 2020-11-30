import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Grid, Icon, makeStyles, SvgIcon, Typography } from '@material-ui/core';

const useStyle = makeStyles((theme) => ({
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
const Card = (props) => {
  const classes = useStyle();
  const { icon, title, description, isLocalIcon } = props;
  return (
    <Box width="400px" height="300px">
      <Grid container direction="column" spacing={3}>
        <Grid item>
          <Avatar alt={title} className={classes.avatar}>
            {isLocalIcon && (
              <SvgIcon className={classes.avatarIcon} component={icon} viewBox="0 0 512 512" />
            )}
            {!isLocalIcon && <Icon className={classes.avatarIcon}>{icon}</Icon>}
          </Avatar>
        </Grid>
        <Grid item>
          <Typography variant="subtitle2">{title}</Typography>
        </Grid>
        <Grid item>
          <Typography variant="caption">{description}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

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
