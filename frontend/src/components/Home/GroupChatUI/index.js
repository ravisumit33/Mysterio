import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Button,
  Container,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { ReactComponent as GroupChatImg } from 'assets/images/group_chat.svg';
import { TextAvatar } from 'components/Avatar';
import { profileStore, appStore } from 'stores';
import NewGroupDialog from './NewGroupDialog';
import GroupPasswordDialog from './GroupPasswordDialog';

const useStyles = makeStyles((theme) => ({
  groupChatUI: {
    [theme.breakpoints.down('sm')]: {
      alignItems: 'center',
    },
  },
  groupChatImg: {
    height: 520,
    [theme.breakpoints.down('sm')]: {
      height: 220,
    },
  },
  groupSearch: {
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
      marginBottom: theme.spacing(2),
    },
    [theme.breakpoints.up('sm')]: {
      margin: `${theme.spacing(3)}px 0`,
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
  const history = useHistory();
  const location = useLocation();

  const {
    groupRooms,
    setGroupRoomsFetched,
    addChatWindow,
    setChatWindowData,
    setShouldOpenUserInfoDialog,
    shouldOpenNewGroupDialog,
    setShouldOpenNewGroupDialog,
    updateGroupRooms,
  } = appStore;
  const [selectedGroup, setSelectedGroup] = useState({ id: -1, name: '' });
  const [newGroupName, setNewGroupName] = useState('');
  const [pendingNewGroupName, setPendingNewGroupName] = useState('');
  const [shouldOpenGroupPasswordDialog, setShouldOpenGroupPasswordDialog] = useState(false);

  useEffect(() => {
    updateGroupRooms();
    setGroupRoomsFetched(true);
  }, [updateGroupRooms, setGroupRoomsFetched]);

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
      history.push('/chat');
    }
    resetState();
  };

  const resetState = () => {
    setSelectedGroup({ id: -1, name: '' });
    setNewGroupName('');
    setPendingNewGroupName('');
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
        history.push('/login', { from: location });
      }
      setShouldOpenNewGroupDialog(true);
    }
  };

  const handleGroupSearchClose = (event, reason) => {
    if (reason === 'toggleInput') {
      return;
    }
    setNewGroupName(pendingNewGroupName);
  };

  return (
    <>
      <Box width="100vw">
        <Container>
          <Grid container justifyContent="space-between" spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={6}>
              <Box pt={1}>
                <GroupChatImg width="100%" className={classes.groupChatImg} />
              </Box>
            </Grid>
            <Grid item container xs={12} md={5} direction="column" className={classes.groupChatUI}>
              <Grid item container xs={12} spacing={2} className={classes.groupSearch}>
                <Box width="50%">
                  <Grid item>
                    <Autocomplete
                      id="Groups-Search-Box"
                      options={groupRooms}
                      noOptionsText="New room will be created"
                      size="small"
                      onClose={handleGroupSearchClose}
                      inputValue={pendingNewGroupName}
                      onInputChange={(event, newGroup) => setPendingNewGroupName(newGroup)}
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
                  <Box my={1}>
                    <Button
                      color="secondary"
                      variant="contained"
                      size="medium"
                      onClick={(evt) => handleStartChat()}
                    >
                      Enter Room
                    </Button>
                  </Box>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h4" className={classes.trendingGroupsTitle}>
                  Trending Rooms <TrendingUpIcon />
                </Typography>
                <List>
                  {trendingGroups.map((group) => (
                    <ListItem
                      button
                      onClick={() => handleStartChat(group)}
                      key={group.id}
                      style={{ maxWidth: 'max-content' }}
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
      <NewGroupDialog
        shouldOpenNewGroupDialog={shouldOpenNewGroupDialog}
        setShouldOpenNewGroupDialog={setShouldOpenNewGroupDialog}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        handleStartGroupChat={handleStartGroupChat}
      />
      <GroupPasswordDialog
        shouldOpenGroupPasswordDialog={shouldOpenGroupPasswordDialog}
        setShouldOpenGroupPasswordDialog={setShouldOpenGroupPasswordDialog}
        handleStartGroupChat={handleStartGroupChat}
      />
    </>
  );
};

export default observer(GroupChatUI);
