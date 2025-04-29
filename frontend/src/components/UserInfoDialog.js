import React, { useEffect } from 'react';
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
import { appStore, ProfileActions } from 'stores';
import { fetchUrl } from 'utils';
import { useBasicInfo, useProfileStore, useAlertStore } from 'hooks';
import { profileManager } from 'managers';
import BasicInfo from './BasicInfo';

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

function UserInfoDialog() {
  const classes = useStyles();
  // @ts-ignore
  const { profileStore, setBasicInfo } = useProfileStore();
  // @ts-ignore
  const { showAlert, hideAlert } = useAlertStore();
  useEffect(() => {
    const { name, avatarUrl, sessionId } = profileStore;
    const hasCompleteBasicInfo = name && avatarUrl && sessionId;
    if (!hasCompleteBasicInfo) {
      appStore.setShouldOpenUserInfoDialog(true);
    }
  }, [profileStore]);

  useEffect(() => {
    if (profileStore.isReady) {
      profileManager.markReady();
    }
  }, [profileStore.isReady]);

  const { name, setName, avatarUrl, setAvatarUrl } = useBasicInfo(
    profileStore.name,
    profileStore.avatarUrl
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
      const formData = new FormData();
      formData.append('file', avatarUrl);
      fileUploadPromise = fetchUrl('/api/upload_avatar/', {
        method: 'post',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then((resp) => {
        const responseData = resp.data;
        // @ts-ignore
        const { url } = responseData;
        return url;
      });
    }

    fileUploadPromise
      .then((url) => {
        hideAlert();
        let profileSessionId = profileStore.sessionId;
        if (!profileSessionId) {
          profileSessionId = `${Date.now()}`;
        }
        setBasicInfo({
          name,
          avatarUrl: url,
          sessionId: profileSessionId,
        });
        appStore.setShouldOpenUserInfoDialog(false);
      })
      .catch(() => {
        showAlert({
          text: 'Error occured while creating avatar. Try choosing random one.',
          severity: 'error',
        });
      });
  };

  return (
    <Dialog open={appStore.shouldOpenUserInfoDialog} maxWidth="xs" fullWidth>
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
            <Button color="secondary" onClick={() => appStore.setShouldOpenUserInfoDialog(false)}>
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

export default observer(UserInfoDialog);
