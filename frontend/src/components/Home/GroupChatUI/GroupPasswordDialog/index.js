import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import { appStore } from 'stores';
import { fetchUrl } from 'utils';

const GroupPasswordDialog = (props) => {
  const { shouldOpenGroupPasswordDialog, setShouldOpenGroupPasswordDialog, handleStartGroupChat } =
    props;

  const [selectedGroupPassword, setSelectedGroupPassword] = useState('');
  const [protectedGroupPasswordFieldData, setProtectedGroupPasswordFieldData] = useState({
    help_text: '',
    error: false,
  });

  const resetState = () => {
    setSelectedGroupPassword('');
  };

  const groupPasswordCheck = () => {
    fetchUrl('/api/chat/group_password_check/', {
      method: 'post',
      body: JSON.stringify({ id: appStore.chatWindowData.roomId, password: selectedGroupPassword }),
    }).then((response) => {
      const responseData = response.data;
      if (responseData.check) {
        appStore.setChatWindowData({
          ...appStore.chatWindowData,
          password: selectedGroupPassword,
        });
        handleStartGroupChat();
        appStore.setShouldShowAlert(false);
        setShouldOpenGroupPasswordDialog(false);
        resetState();
      } else {
        appStore.setAlert({
          text: 'Invalid room password.',
          severity: 'error',
        });
        appStore.setShouldShowAlert(true);
        setShouldOpenGroupPasswordDialog(true);
        const newProtectedGroupPasswordFieldData = { ...protectedGroupPasswordFieldData };
        if (responseData.password) {
          [newProtectedGroupPasswordFieldData.help_text] = responseData.password;
          newProtectedGroupPasswordFieldData.error = true;
        } else {
          newProtectedGroupPasswordFieldData.help_text = '';
          newProtectedGroupPasswordFieldData.error = false;
        }
        setProtectedGroupPasswordFieldData(newProtectedGroupPasswordFieldData);
      }
    });
  };
  return (
    <Dialog
      open={shouldOpenGroupPasswordDialog}
      onClose={() => setShouldOpenGroupPasswordDialog(false)}
      onKeyPress={(e) => e.key === 'Enter' && groupPasswordCheck()}
    >
      <DialogTitle>Enter Password</DialogTitle>
      <form
        onSubmit={(evt) => {
          evt.preventDefault();
          groupPasswordCheck();
          evt.stopPropagation();
        }}
      >
        <DialogContent>
          <DialogContentText>This room is protected with a password</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            fullWidth
            value={selectedGroupPassword}
            onChange={(evt) => setSelectedGroupPassword(evt.target.value)}
            required
            helperText={protectedGroupPasswordFieldData.help_text}
            error={protectedGroupPasswordFieldData.error}
            inputProps={{ type: 'password' }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            type="submit"
            onClick={(evt) => {
              evt.preventDefault();
              groupPasswordCheck();
              evt.stopPropagation();
            }}
            color="primary"
          >
            Enter room
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

GroupPasswordDialog.propTypes = {
  shouldOpenGroupPasswordDialog: PropTypes.bool,
  setShouldOpenGroupPasswordDialog: PropTypes.func.isRequired,
  handleStartGroupChat: PropTypes.func.isRequired,
};

GroupPasswordDialog.defaultProps = {
  shouldOpenGroupPasswordDialog: false,
};

export default observer(GroupPasswordDialog);
