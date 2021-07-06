import React from 'react';
import { Box, Snackbar, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import { observer } from 'mobx-react-lite';
import { appStore } from 'stores';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

const AppAlert = (props) => {
  const classes = useStyles();
  const { alert, shouldShowAlert, setShouldShowAlert } = appStore;

  return (
    <Box className={classes.root}>
      <Snackbar
        open={shouldShowAlert}
        autoHideDuration={4000}
        onClose={() => setShouldShowAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        action={alert.action}
      >
        <Alert
          onClose={() => setShouldShowAlert(false)}
          severity={alert.severity}
          action={alert.action}
        >
          <Typography variant="body2">{alert.text}</Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default observer(AppAlert);
