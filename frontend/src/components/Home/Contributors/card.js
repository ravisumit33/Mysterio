import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Grid, Link, makeStyles, Typography } from '@material-ui/core';

const useStyle = makeStyles((theme) => ({
  avatar: {
    width: theme.spacing(12),
    height: theme.spacing(12),
    margin: '0 auto',
    backgroundColor: '#38d2d9',
  },
}));
const Card = (props) => {
  const classes = useStyle();
  const { icon, title, description, href } = props;

  return (
    <Box width="400px" height="200px">
      <Grid container direction="column" spacing={3}>
        <Grid item>
          <Avatar className={classes.avatar} alt={title} src={icon} />
        </Grid>
        <Grid item>
          <Typography variant="subtitle2">
            <Link href={href} target="_blank" rel="noopener" underline="none">
              {title}
            </Link>
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="body1">{description}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

Card.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  href: PropTypes.string,
};

Card.defaultProps = {
  icon: '',
  title: '',
  description: '',
  href: '',
};

export default Card;
