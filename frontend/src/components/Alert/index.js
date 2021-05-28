import React from 'react';
import { Box, Snackbar } from '@material-ui/core';
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
        autoHideDuration={6000}
        onClose={() => setShouldShowAlert(false)}
      >
        <Alert onClose={() => setShouldShowAlert(false)} severity={alert.severity}>
          {alert.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default observer(AppAlert);
