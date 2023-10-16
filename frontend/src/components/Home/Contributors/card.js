import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Link, Stack, Typography } from '@mui/material';
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
    width: theme.spacing(12),
    height: theme.spacing(12),
    margin: '0 auto',
    backgroundColor: '#38d2d9',
  },
}));
function Card(props) {
  const classes = useStyle();
  const { icon, title, description, href } = props;

  return (
    <Box className={classes.root}>
      <Stack spacing={3}>
        <Avatar className={classes.avatar} alt={title} src={icon} />
        <Typography align="center" variant="subtitle2">
          <Link href={href} target="_blank" rel="noopener" underline="none">
            {title}
          </Link>
        </Typography>
        {description && (
          <Typography align="center" variant="body1">
            {description}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

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
