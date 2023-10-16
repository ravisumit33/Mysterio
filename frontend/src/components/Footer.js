import React from 'react';
import EmailIcon from '@mui/icons-material/Email';
import { Link, Stack, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyle = makeStyles((theme) => ({
  footer: {
    padding: theme.spacing(1, 0, 0.5, 0),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main),
  },
  icon: {
    padding: theme.spacing(0, 1),
  },
}));

function Footer() {
  const classes = useStyle();

  return (
    <Stack className={classes.footer} alignItems="center" spacing={1}>
      <Stack direction="row" spacing={1} justifyContent="center">
        <EmailIcon fontSize="medium" />
        <Link
          href="mailto:support@mysterio-chat.com"
          variant="subtitle2"
          color="inherit"
          underline="hover"
        >
          support@mysterio-chat.com
        </Link>
      </Stack>
      <Typography variant="caption">© 2022 Mysterio Chat</Typography>
    </Stack>
  );
}

export default Footer;
