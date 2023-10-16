import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Avatar, Box, Button, Container, Grid, Stack } from '@mui/material';
import { makeStyles } from '@mui/styles';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import groupChatJson from 'assets/animations/group-chat.json';
import CustomAutoComplete from 'components/customAutoComplete';
import Animation from 'components/Animation';
import { appStore } from 'stores';
import TrendingGroups from './TrendingGroups';
import GroupPasswordDialog from './GroupPasswordDialog';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.grey[100],
  },
  groupChatUI: {
    [theme.breakpoints.down('md')]: {
      alignItems: 'center',
    },
  },
  groupChatImg: {
    height: 520,
    [theme.breakpoints.down('md')]: {
      height: 220,
    },
  },
  groupSearch: {
    [theme.breakpoints.down('md')]: {
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

  return (
    <>
      <Box className={classes.root}>
        <Container>
          <Grid container justifyContent="center" alignItems="center" rowGap={3} columnGap={10}>
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
            <Grid item xs={12} sm={8} md={5}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1}>
                  <CustomAutoComplete
                    autoCompleteProps={{
                      id: 'Groups-Search-Box',
                      options: [newGroupOption, ...groupRooms],
                      onClose: handleGroupSearchClose,
                      inputValue: pendingNewGroupName,
                      getOptionLabel: (option) => {
                        if (option.id > 0) return option.name;
                        if (option.id === -1) return pendingNewGroupName;
                        return '';
                      },
                      noOptionsText: 'No room',
                      sx: { flex: 1 },
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
                            appStore.showAlert({
                              text: 'Room name cannot be empty',
                              severity: 'error',
                            });
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
                    getSecondaryText={(group) =>
                      group.id > 0 ? `${group.message_count} messages` : ''
                    }
                  />
                  <Button
                    color="secondary"
                    variant="contained"
                    size="medium"
                    disabled={!pendingNewGroupName || !selectedGroup}
                    onClick={(evt) => handleStartChat()}
                  >
                    {groupAction} Room
                  </Button>
                </Stack>
                {trendingGroups.length > 0 && (
                  <TrendingGroups trendingGroups={trendingGroups} onStartChat={handleStartChat} />
                )}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
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
