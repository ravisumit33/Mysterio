import React from 'react';
import Box from '@material-ui/core/Box';
import { Grid, makeStyles, Typography } from '@material-ui/core';

const useStyle = makeStyles((theme) => ({
  footer: {
    height: theme.spacing(5),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main),
  },
}));

const Footer = () => {
  const classes = useStyle();

  return (
    <Box>
      <Grid className={classes.footer} container justify="center" alignContent="center">
        <Grid item>
          <Typography variant="body1">© 2020 Mysterio - Anonymous Chat</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Footer;
