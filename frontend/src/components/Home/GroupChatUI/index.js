import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import {
  Avatar,
  Button,
  Container,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Typography,
} from '@material-ui/core';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { createFilterOptions } from '@material-ui/lab/Autocomplete';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import groupChatJson from 'assets/animations/group-chat.json';
import CustomAvatar from 'components/Avatar';
import CustomAutoComplete from 'components/customAutoComplete';
import Animation from 'components/Animation';
import { appStore } from 'stores';
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
      // justifyContent: 'center',
      flexDirection: 'column',
      alignItems: 'stretch',
      marginBottom: theme.spacing(2),
    },
    [theme.breakpoints.up('sm')]: {
      margin: theme.spacing(3, 0),
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

function GroupChatUI() {
  const classes = useStyles();
  const history = useHistory();
  const AddCircleAvatar = useCallback(
    () => (
      <Avatar>
        <AddCircleIcon />
      </Avatar>
    ),
    []
  );
  const { current: newGroupOption } = useRef({
    id: -1,
    name: 'New room',
    avatar: AddCircleAvatar,
  });

  const [groupAction, setGroupAction] = useState('Create');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [pendingNewGroupName, setPendingNewGroupName] = useState('');
  const [shouldOpenGroupPasswordDialog, setShouldOpenGroupPasswordDialog] = useState(false);
  const [chatWindowData, setChatWindowData] = useState({ roomId: 0, name: '' });

  const { groupRooms, setGroupRoomsFetched, addChatWindow, updateGroupRooms } = appStore;

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

  const handleStartGroupChat = (windowData) => {
    addChatWindow(windowData);
    history.push('/chat');
  };

  const handleStartChat = (group) => {
    const chatGroup = group || selectedGroup;
    if (chatGroup) {
      if (chatGroup.id === -1) {
        newGroupName && history.push('/room', { name: newGroupName });
      } else {
        const windowData = {
          roomId: chatGroup.id,
          name: chatGroup.name,
          avatarUrl: chatGroup.avatar_url,
          isGroupRoom: true,
        };
        setChatWindowData(windowData);
        if (chatGroup.is_protected) {
          setShouldOpenGroupPasswordDialog(true);
        } else {
          handleStartGroupChat(windowData);
        }
      }
    }
  };

  const handleGroupSearchClose = (event, reason) => {
    if (reason === 'toggleInput') {
      return;
    }
    setNewGroupName(pendingNewGroupName);
  };

  const groupSearchFilterOptions = (options, state) => {
    const results = createFilterOptions()(options, state);
    results.unshift(newGroupOption);
    if (selectedGroup && !results.includes(selectedGroup)) results.unshift(selectedGroup);
    return results;
  };

  return (
    <>
      <Container>
        <Grid container justifyContent="space-between" spacing={2} alignItems="flex-start">
          <Grid item container justifyContent="center" xs={12} md={6}>
            <Grid item>
              <Animation
                containerId="group-chat"
                width={60}
                height={60}
                smallScreenWidth={30}
                smallScreenHeight={30}
                animationData={groupChatJson}
              />
            </Grid>
          </Grid>
          <Grid item container xs={12} md={5} direction="column" className={classes.groupChatUI}>
            <Grid item container xs={12} spacing={2} className={classes.groupSearch}>
              <Grid item xs>
                <CustomAutoComplete
                  autoCompleteProps={{
                    id: 'Groups-Search-Box',
                    options: groupRooms,
                    onClose: handleGroupSearchClose,
                    inputValue: pendingNewGroupName,
                    getOptionLabel: (option) => {
                      if (option.id > 0) return option.name;
                      if (option.id === -1) return pendingNewGroupName;
                      return '';
                    },
                    filterOptions: groupSearchFilterOptions,
                  }}
                  value={selectedGroup}
                  setPendingValue={setPendingNewGroupName}
                  setValue={(newSelectedGroup) => {
                    if (!newSelectedGroup) {
                      setGroupAction('Create');
                      setSelectedGroup(null);
                    } else {
                      if (newSelectedGroup.id === -1) {
                        setGroupAction('Create');
                        if (!pendingNewGroupName) {
                          setSelectedGroup(null);
                          return;
                        }
                      } else {
                        setGroupAction('Enter');
                      }
                      setSelectedGroup(newSelectedGroup);
                    }
                  }}
                  inputLabel="Enter room name"
                  nameField="name"
                  getSecondaryText={(group) => {
                    if (group.id > 0) {
                      return `${group.message_count} messages`;
                    }
                    return '';
                  }}
                />
              </Grid>
              <Grid item>
                <Grid container justifyContent="center">
                  <Button
                    color="secondary"
                    variant="contained"
                    size="medium"
                    disabled={!pendingNewGroupName || !selectedGroup}
                    onClick={(evt) => handleStartChat()}
                  >
                    {groupAction} Room
                  </Button>
                </Grid>
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
                      <CustomAvatar name={group.name} avatarUrl={group.avatar_url} />
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
      <GroupPasswordDialog
        shouldOpenGroupPasswordDialog={shouldOpenGroupPasswordDialog}
        setShouldOpenGroupPasswordDialog={setShouldOpenGroupPasswordDialog}
        handleStartGroupChat={handleStartGroupChat}
        chatWindowData={chatWindowData}
      />
    </>
  );
}

export default observer(GroupChatUI);
