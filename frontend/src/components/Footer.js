import React from 'react';
import EmailIcon from '@material-ui/icons/Email';
import { Grid, Link, makeStyles, Typography } from '@material-ui/core';

const useStyle = makeStyles((theme) => ({
  footer: {
    padding: `${theme.spacing(1)}px 0 ${theme.spacing(0.5)}px 0`,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main),
  },
  icon: {
    padding: `0 ${theme.spacing(1)}px`,
  },
}));

function Footer() {
  const classes = useStyle();

  return (
    <Grid className={classes.footer} container alignItems="center" direction="column">
      <Grid item container justifyContent="center">
        <Grid item className={classes.icon}>
          <EmailIcon fontSize="medium" />
        </Grid>
        <Grid item>
          <Link href="mailto:support@mysterio-chat.com" variant="subtitle2" color="inherit">
            support@mysterio-chat.com
          </Link>
        </Grid>
      </Grid>
      <Grid item>
        <Typography variant="caption">© 2022 Mysterio Chat</Typography>
      </Grid>
    </Grid>
  );
}

export default Footer;
