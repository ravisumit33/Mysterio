import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { ReactComponent as GroupChatImg } from 'assets/images/group_chat.svg';
import { TextAvatar } from 'components/Avatar';
import { profileStore, appStore } from 'stores';
import { fetchUrl } from 'utils';

const useStyles = makeStyles((theme) => ({
  groupChatUI: {
    [theme.breakpoints.down('sm')]: {
      alignItems: 'center',
    },
  },
  groupSearch: {
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
    },
  },
  groupSearchLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    right: theme.spacing(5), // do not overlap icon
    bottom: 0,
  },
  groupSearchLabelShrinked: {
    right: 'unset', // show complete label if shrinked
  },
  trendingGroupsTitle: {
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
    },
  },
}));

const GroupChatUI = () => {
  const classes = useStyles();

  const {
    groupRooms,
    setGroupRooms,
    addChatWindow,
    setChatWindowData,
    setShouldOpenUserInfoDialog,
    setShouldOpenLoginSignupDialog,
    shouldOpenNewGroupDialog,
    setShouldOpenNewGroupDialog,
  } = appStore;
  const [selectedGroup, setSelectedGroup] = useState({ id: -1, name: '' });
  const [selectedGroupPassword, setSelectedGroupPassword] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [pendingNewGroupName, setPendingNewGroupName] = useState('');
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
  const [protectedGroupPasswordFieldData, setProtectedGroupPasswordFieldData] = useState({
    help_text: '',
    error: false,
  });
  const [shouldOpenGroupPasswordDialog, setShouldOpenGroupPasswordDialog] = useState(false);

  useEffect(() => {
    fetchUrl('/api/chat/groups/').then((response) => {
      setGroupRooms(Object.values(response.data));
    });
  }, [setGroupRooms]);

  const trendingGroups = [...groupRooms]
    .sort((a, b) => {
      const zscoreA = parseFloat(a.zscore);
      const zscoreB = parseFloat(b.zscore);
      return zscoreB - zscoreA;
    })
    .slice(0, 5);

  const handleStartGroupChat = () => {
    if (!profileStore.name) {
      setShouldOpenUserInfoDialog(true);
    } else {
      addChatWindow();
    }
    resetState();
  };

  const resetState = () => {
    setSelectedGroup({ id: -1, name: '' });
    setSelectedGroupPassword('');
    setNewGroupName('');
    setPendingNewGroupName('');
    setShouldUseGroupPassword(false);
    setNewGroupPassword('');
  };

  const handleCreateGroup = () => {
    fetchUrl('/api/chat/groups/', {
      method: 'post',
      body: JSON.stringify({
        name: newGroupName,
        password: newGroupPassword,
        is_protected: shouldUseGroupPassword,
      }),
    }).then((response) => {
      const responseData = response.data;
      const groupNameFieldData = { ...newGroupNameFieldData };
      const groupPasswordFieldData = { ...newGroupPasswordFieldData };
      if (response.status >= 400) {
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
        appStore.setAlert({
          text: 'Unable to create group.',
          severity: 'error',
        });
        appStore.setShouldShowAlert(true);
        setNewGroupNameFieldData(groupNameFieldData);
        setNewGroupPasswordFieldData(groupPasswordFieldData);
        setShouldOpenNewGroupDialog(true);
      } else {
        setShouldOpenNewGroupDialog(false);
        const chatWindowData = {
          roomId: response.data.id,
          name: response.data.name,
          password: newGroupPassword,
        };
        setChatWindowData(chatWindowData);
        handleStartGroupChat();
      }
    });
  };

  const handleStartChat = (group) => {
    let chatWindowData;
    const chatGroup = group || selectedGroup;
    if (chatGroup && chatGroup.id !== -1) {
      chatWindowData = {
        roomId: chatGroup.id,
        name: chatGroup.name,
      };
      setChatWindowData(chatWindowData);
      if (chatGroup.is_protected) {
        setShouldOpenGroupPasswordDialog(true);
      } else {
        handleStartGroupChat();
      }
    } else if (newGroupName) {
      if (!profileStore.isLoggedIn) {
        setShouldOpenLoginSignupDialog(true);
      } else {
        setShouldOpenNewGroupDialog(true);
      }
    }
  };

  const handleGroupSearchClose = (event, reason) => {
    if (reason === 'toggleInput') {
      return;
    }
    setNewGroupName(pendingNewGroupName);
  };

  const groupPasswordCheck = () => {
    fetchUrl('/api/chat/group_password_check/', {
      method: 'post',
      body: JSON.stringify({ id: appStore.chatWindowData.roomId, password: selectedGroupPassword }),
    }).then((response) => {
      const responseData = response.data;
      if (responseData.check) {
        setChatWindowData({
          ...appStore.chatWindowData,
          password: selectedGroupPassword,
        });
        handleStartGroupChat();
        setShouldOpenGroupPasswordDialog(false);
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

  const newGroupDialog = (
    <Dialog
      open={shouldOpenNewGroupDialog}
      onClose={() => setShouldOpenNewGroupDialog(false)}
      onKeyPress={(e) => e.key === 'Enter' && handleCreateGroup()}
    >
      <DialogTitle>New Room</DialogTitle>
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
        <Button onClick={handleCreateGroup} color="primary">
          Create room
        </Button>
      </DialogActions>
    </Dialog>
  );

  const groupPasswordDialog = (
    <Dialog
      open={shouldOpenGroupPasswordDialog}
      onClose={() => setShouldOpenGroupPasswordDialog(false)}
      onKeyPress={(e) => e.key === 'Enter' && groupPasswordCheck()}
    >
      <DialogTitle>Enter Password</DialogTitle>
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
        <Button onClick={groupPasswordCheck} color="primary">
          Enter room
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      <Box width="100vw">
        <Container>
          <Grid container justify="space-between" spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={6}>
              <Box py={2}>
                <GroupChatImg width="100%" height="400" />
              </Box>
            </Grid>
            <Grid item container xs={12} md={5} direction="column" className={classes.groupChatUI}>
              <Grid item container xs={12} spacing={2} className={classes.groupSearch}>
                <Box width="50%" my={3}>
                  <Grid item>
                    <Autocomplete
                      id="Groups-Search-Box"
                      options={groupRooms}
                      noOptionsText="New room will be created"
                      size="small"
                      onClose={handleGroupSearchClose}
                      inputValue={pendingNewGroupName}
                      onInputChange={(event, newGroup) => {
                        setPendingNewGroupName(newGroup);
                      }}
                      value={selectedGroup}
                      onChange={(event, newGroup) => setSelectedGroup(newGroup)}
                      renderInput={(params) => (
                        <TextField
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...params}
                          label="Search/Create rooms"
                          margin="normal"
                          variant="outlined"
                          InputLabelProps={{
                            classes: {
                              root: classes.groupSearchLabel,
                              shrink: classes.groupSearchLabelShrinked,
                            },
                          }}
                        />
                      )}
                      renderOption={(option) => (
                        <Tooltip title={option.name} arrow>
                          <ListItem disableGutters>
                            <ListItemAvatar>
                              <TextAvatar name={option.name} />
                            </ListItemAvatar>
                            <ListItemText
                              primary={option.name}
                              secondary={`${option.message_count} messages`}
                              primaryTypographyProps={{ noWrap: true }}
                              secondaryTypographyProps={{ noWrap: true }}
                            />
                          </ListItem>
                        </Tooltip>
                      )}
                      getOptionLabel={(option) => option.name || ''}
                    />
                  </Grid>
                </Box>
                <Grid item>
                  <Box my={4}>
                    <Button
                      color="secondary"
                      variant="contained"
                      size="medium"
                      onClick={() => handleStartChat()}
                    >
                      Enter Room
                    </Button>
                  </Box>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h5" className={classes.trendingGroupsTitle}>
                  Trending Groups <TrendingUpIcon />
                </Typography>
                <List>
                  {trendingGroups.map((group) => (
                    <ListItem
                      button
                      onClick={() => handleStartChat(group)}
                      key={group.id}
                      style={{ maxWidth: 'fit-content' }}
                    >
                      <ListItemAvatar>
                        <TextAvatar name={group.name} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={group.name}
                        secondary={`${group.message_count} messages`}
                        primaryTypographyProps={{ noWrap: true }}
                        secondaryTypographyProps={{ noWrap: true }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
      {newGroupDialog}
      {groupPasswordDialog}
    </>
  );
};

export default observer(GroupChatUI);
