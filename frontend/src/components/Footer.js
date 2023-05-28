import React from 'react';
import EmailIcon from '@mui/icons-material/Email';
import { Grid, Link, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyle = makeStyles((theme) => ({
  footer: {
    padding: `${theme.spacing(1)} 0 ${theme.spacing(0.5)} 0`,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main),
  },
  icon: {
    padding: `0 ${theme.spacing(1)}`,
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
          <Link
            href="mailto:support@mysterio-chat.com"
            variant="subtitle2"
            color="inherit"
            underline="hover"
          >
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
