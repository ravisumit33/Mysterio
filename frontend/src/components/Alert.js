import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { Box, Button, IconButton, Snackbar, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import { observer } from 'mobx-react-lite';
import { useAlertStore, useUserStore } from 'hooks';
import { isLoggedIn } from 'selectors';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

function LoginAction() {
  const location = useLocation();
  const history = useHistory();
  // @ts-ignore
  const { userStore } = useUserStore();
  // @ts-ignore
  const { hideAlert } = useAlertStore();
  const handleLogin = () => {
    hideAlert();
    history.push('/login', { from: location });
  };

  return isLoggedIn(userStore) ? null : (
    <>
      <Button color="secondary" size="small" onClick={handleLogin} variant="text">
        login
      </Button>
      <IconButton size="small" aria-label="close" color="inherit" onClick={hideAlert}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );
}

function AppAlert() {
  const classes = useStyles();
  // @ts-ignore
  const { alertStore, hideAlert } = useAlertStore();

  const getAlertAction = () => {
    switch (alertStore.action) {
      case 'login':
        return <LoginAction />;
      default:
        return null;
    }
  };

  return (
    <Box className={classes.root}>
      <Snackbar
        open={alertStore.visible}
        autoHideDuration={5000}
        onClose={hideAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={hideAlert} severity={alertStore.severity} action={getAlertAction()}>
          <Typography variant="body2">{alertStore.text}</Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default observer(AppAlert);
