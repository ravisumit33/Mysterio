import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
} from '@material-ui/core';
import { appStore } from 'stores';
import { fetchUrl } from 'utils';

const NewGroupDialog = (props) => {
  const {
    shouldOpenNewGroupDialog,
    setShouldOpenNewGroupDialog,
    newGroupName,
    setNewGroupName,
    handleStartGroupChat,
  } = props;

  const [shouldUseGroupPassword, setShouldUseGroupPassword] = useState(false);
  const [newGroupPassword, setNewGroupPassword] = useState('');
  const [newGroupNameFieldData, setNewGroupNameFieldData] = useState({
    help_text: '',
    error: false,
  });
  const [newGroupPasswordFieldData, setNewGroupPasswordFieldData] = useState({
    help_text: '',
    error: false,
  });

  const resetState = () => {
    setShouldUseGroupPassword(false);
    setNewGroupPassword('');
  };

  const handleCreateGroup = () => {
    fetchUrl('/api/chat/groups/', {
      method: 'post',
      body: {
        name: newGroupName,
        password: newGroupPassword,
        is_protected: shouldUseGroupPassword,
      },
    })
      .then((response) => {
        appStore.setShouldShowAlert(false);
        setShouldOpenNewGroupDialog(false);
        const responseData = response.data;
        const chatWindowData = {
          roomId: responseData.id,
          name: responseData.name,
          password: newGroupPassword,
        };
        appStore.setChatWindowData(chatWindowData);
        handleStartGroupChat();
        resetState();
      })
      .catch((response) => {
        const responseData = response.data;
        const groupNameFieldData = { ...newGroupNameFieldData };
        const groupPasswordFieldData = { ...newGroupPasswordFieldData };
        if (responseData.name) {
          [groupNameFieldData.help_text] = responseData.name;
          groupNameFieldData.error = true;
        } else {
          groupNameFieldData.help_text = '';
          groupNameFieldData.error = false;
        }
        if (responseData.password) {
          [groupPasswordFieldData.help_text] = responseData.password;
          groupPasswordFieldData.error = true;
        } else {
          groupPasswordFieldData.help_text = '';
          groupPasswordFieldData.error = false;
        }
        appStore.showAlert({
          text: 'Error occurred while creating room.',
          severity: 'error',
        });
        setNewGroupNameFieldData(groupNameFieldData);
        setNewGroupPasswordFieldData(groupPasswordFieldData);
        setShouldOpenNewGroupDialog(true);
      });
  };

  return (
    <Dialog
      open={shouldOpenNewGroupDialog}
      onClose={() => setShouldOpenNewGroupDialog(false)}
      onKeyPress={(e) => e.key === 'Enter' && handleCreateGroup()}
    >
      <DialogTitle>New Room</DialogTitle>
      <form
        onSubmit={(evt) => {
          evt.preventDefault();
          handleCreateGroup();
          evt.stopPropagation();
        }}
      >
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={newGroupName}
            onChange={(evt) => setNewGroupName(evt.target.value)}
            helperText={newGroupNameFieldData.help_text}
            error={newGroupNameFieldData.error}
            required
          />
          <TextField
            autoFocus
            disabled={!shouldUseGroupPassword}
            margin="dense"
            label="Password"
            fullWidth
            value={newGroupPassword}
            onChange={(evt) => setNewGroupPassword(evt.target.value)}
            required
            helperText={shouldUseGroupPassword && newGroupPasswordFieldData.help_text}
            error={shouldUseGroupPassword && newGroupPasswordFieldData.error}
            inputProps={{ type: 'password' }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={shouldUseGroupPassword}
                onChange={(evt) => setShouldUseGroupPassword(evt.target.checked)}
              />
            }
            label="Protect with password"
          />
        </DialogContent>
        <DialogActions>
          <Button
            type="submit"
            onClick={(evt) => {
              evt.preventDefault();
              handleCreateGroup();
              evt.stopPropagation();
            }}
            color="primary"
          >
            Create room
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

NewGroupDialog.propTypes = {
  shouldOpenNewGroupDialog: PropTypes.bool,
  setShouldOpenNewGroupDialog: PropTypes.func.isRequired,
  newGroupName: PropTypes.string.isRequired,
  setNewGroupName: PropTypes.func.isRequired,
  handleStartGroupChat: PropTypes.func.isRequired,
};

NewGroupDialog.defaultProps = {
  shouldOpenNewGroupDialog: false,
};

export default observer(NewGroupDialog);
