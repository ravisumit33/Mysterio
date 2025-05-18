import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Face } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import {
  useBasicInfo,
  useProfileStore,
  useGlobalDialogStore,
  useAlertStore,
  useTaskRunnerWithAlert,
} from 'hooks';
import { uploadAvatarService } from 'services';
import PropTypes from 'prop-types';
import BasicInfo from '../BasicInfo';

const userAvatarStyles = [
  'adventurer',
  'adventurer-neutral',
  'avataaars',
  'avataaars-neutral',
  'big-ears',
  'big-ears-neutral',
  'big-smile',
  'croodles',
  'croodles-neutral',
  'fun-emoji',
  'lorelei',
  'lorelei-neutral',
  'micah',
  'miniavs',
  'notionists',
  'notionists-neutral',
  'open-peeps',
  'personas',
  'pixel-art',
  'pixel-art-neutral',
  'thumbs',
];

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    overflowY: 'visible',
  },
}));

function UserInfoDialog({ payload }) {
  const { onSuccess, onCancel } = payload;
  const classes = useStyles();
  // @ts-ignore
  const { profileStore, setBasicInfo } = useProfileStore();
  // @ts-ignore
  const { showAlert } = useAlertStore();
  // @ts-ignore
  const { globalDialogStore, closeGlobalDialog } = useGlobalDialogStore();
  const runTaskWithAlert = useTaskRunnerWithAlert();

  const { name, setName, avatarUrl, setAvatarUrl } = useBasicInfo(
    profileStore.name,
    profileStore.avatarUrl,
  );

  const handleDialogueButtonClick = () => {
    if (!name) {
      showAlert({
        text: 'Name cannot be empty.',
        severity: 'error',
      });
      return;
    }
    if (!avatarUrl) {
      showAlert({
        text: 'No image chosen. Upload your own or click on choose random.',
        severity: 'error',
      });
      return;
    }
    let fileUploadPromise = Promise.resolve(avatarUrl);
    if (/^blob:.*$/.test(avatarUrl)) {
      fileUploadPromise = uploadAvatarService(avatarUrl).then((resp) => {
        const responseData = resp.data;
        // @ts-ignore
        const { url } = responseData;
        return url;
      });
    }

    runTaskWithAlert({
      task: () => fileUploadPromise,
      onSuccessCb: (url) => {
        let profileSessionId = profileStore.sessionId;
        if (!profileSessionId) {
          profileSessionId = `${Date.now()}`;
        }
        setBasicInfo({
          name,
          avatarUrl: url,
          sessionId: profileSessionId,
        });
        closeGlobalDialog();
        onSuccess();
      },
      onErrorCb: (resp, showAlertCb) => {
        showAlertCb({
          text: 'Error occured while creating avatar. Try choosing random one.',
          severity: 'error',
        });
      },
    });
  };

  return (
    <Dialog open={globalDialogStore.isOpen} maxWidth="xs" fullWidth>
      <DialogTitle>Let&apos;s get started!</DialogTitle>
      <form
        onSubmit={(evt) => {
          evt.preventDefault();
          handleDialogueButtonClick();
        }}
      >
        <DialogContent classes={{ root: classes.dialogContent }}>
          <DialogContentText>
            Create your anonymous avatar for this session by giving it a name and a look.
          </DialogContentText>
          <BasicInfo
            name={name}
            onNameChange={setName}
            nameProps={{ label: 'Give yourself a name' }}
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
            avatarProps={{ DefaultIcon: Face, styles: userAvatarStyles }}
          />
        </DialogContent>
        <DialogActions>
          {profileStore.sessionId && (
            <Button
              color="secondary"
              onClick={() => {
                closeGlobalDialog();
                onCancel();
              }}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" color="primary">
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

UserInfoDialog.propTypes = {
  payload: PropTypes.shape({
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func,
  }),
};

UserInfoDialog.defaultProps = {
  payload: {
    onSuccess: () => {},
    onCancel: () => {},
  },
};

export default observer(UserInfoDialog);
