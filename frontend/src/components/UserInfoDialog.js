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
import { appStore, profileStore } from 'stores';
import { fetchUrl, isDevEnv } from 'utils';
import { useBasicInfo } from 'hooks';
import { SessionStorageKeys, SessionStorageKeysPrefix } from 'appConstants';
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
  const storedProfileName = window.sessionStorage.getItem(
    `${SessionStorageKeysPrefix}${SessionStorageKeys.profileName}`
  );
  const storedProfileAvatarUrl = window.sessionStorage.getItem(
    `${SessionStorageKeysPrefix}${SessionStorageKeys.profileAvatarUrl}`
  );
  const { name, setName, avatarUrl, setAvatarUrl } = useBasicInfo(
    storedProfileName,
    storedProfileAvatarUrl
  );

  const handleDialogueButtonClick = () => {
    if (!name) {
      appStore.showAlert({
        text: 'Name cannot be empty.',
        severity: 'error',
      });
      return;
    }
    if (!avatarUrl) {
      appStore.showAlert({
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
        appStore.setShouldShowAlert(false);
        window.sessionStorage.setItem(
          `${SessionStorageKeysPrefix}${SessionStorageKeys.profileName}`,
          name
        );
        window.sessionStorage.setItem(
          `${SessionStorageKeysPrefix}${SessionStorageKeys.profileAvatarUrl}`,
          url
        );
        profileStore.setName(name);
        profileStore.setAvatarUrl(url);
        if (isDevEnv()) {
          profileStore.setSessionId(`${Date.now()}`);
        } else {
          profileStore.setSessionId(`${crypto.randomUUID()}`);
        }
      })
      .catch(() => {
        appStore.showAlert({
          text: 'Error occured while creating avatar. Try choosing random one.',
          severity: 'error',
        });
      });
  };

  const shouldOpen = !profileStore.hasCompleteUserInfo;

  return (
    <Dialog open={shouldOpen} maxWidth="xs" fullWidth>
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
          <Button type="submit" color="primary">
            Go
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default observer(UserInfoDialog);
