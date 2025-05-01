import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { Box, Button, IconButton, Snackbar, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import { observer } from 'mobx-react-lite';
import { useAlertStore, useUserStore } from 'hooks';
import { isLoggedIn } from 'selectors';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

function LoginAction({ hideAlert }) {
  const location = useLocation();
  const history = useHistory();
  // @ts-ignore
  const { userStore } = useUserStore();

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

LoginAction.propTypes = {
  hideAlert: PropTypes.func.isRequired,
};

function AppAlert() {
  const classes = useStyles();
  // @ts-ignore
  const { popAlert } = useAlertStore();
  const [open, setOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);

  useEffect(() => {
    const newAlert = popAlert();
    if (newAlert && !currentAlert) {
      setCurrentAlert({ ...newAlert });
      setOpen(true);
    } else if (newAlert && currentAlert && open) {
      setOpen(false);
    }
  }, [currentAlert, open, popAlert]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const getAlertAction = () => {
    switch (currentAlert.action) {
      case 'login':
        return <LoginAction hideAlert={handleClose} />;
      default:
        return null;
    }
  };

  const handleExited = () => {
    setCurrentAlert(null);
  };

  // Reason we do not show stacked notifications: https://ux.stackexchange.com/a/74930
  return (
    <Box className={classes.root}>
      <Snackbar
        key={currentAlert ? currentAlert.id : undefined}
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        TransitionProps={{ onExited: handleExited }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleClose} severity={currentAlert.severity} action={getAlertAction()}>
          <Typography variant="body2">{currentAlert.text}</Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default observer(AppAlert);
