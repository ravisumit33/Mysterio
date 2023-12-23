import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { Box, Button, IconButton, Snackbar, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import { observer } from 'mobx-react-lite';
import { appStore, profileStore } from 'stores';

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
  const handleLogin = () => {
    handleAlertClose();
    history.push('/login', { from: location });
  };

  const handleAlertClose = () => appStore.setShouldShowAlert(false);
  return profileStore.isLoggedIn ? null : (
    <>
      <Button color="secondary" size="small" onClick={handleLogin} variant="text">
        login
      </Button>
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleAlertClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );
}

function AppAlert() {
  const classes = useStyles();
  const { alert, shouldShowAlert, setShouldShowAlert } = appStore;

  const getAlertAction = () => {
    switch (alert.action) {
      case 'login':
        return <LoginAction />;
      default:
        return null;
    }
  };

  return (
    <Box className={classes.root}>
      <Snackbar
        open={shouldShowAlert}
        autoHideDuration={5000}
        onClose={() => setShouldShowAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShouldShowAlert(false)}
          severity={alert.severity}
          action={getAlertAction()}
        >
          <Typography variant="body2">{alert.text}</Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default observer(AppAlert);
