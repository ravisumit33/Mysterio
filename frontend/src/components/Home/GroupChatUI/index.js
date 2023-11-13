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
import { RoomType } from 'appConstants';
import TrendingGroupRooms from './TrendingGroupRooms';
import RoomPasswordDialog from './RoomPasswordDialog';

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
  const { current: newRoomOption } = useRef({
    id: -1,
    name: 'New room',
    avatar: AddCircleAvatar,
  });

  const [roomAction, setRoomAction] = useState('Create');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newRoomName, setNewRoomName] = useState('');
  const [pendingNewRoomName, setPendingNewRoomName] = useState('');
  const [shouldOpenRoomPasswordDialog, setShouldOpenRoomPasswordDialog] = useState(false);
  const [chatWindowData, setChatWindowData] = useState({ roomId: 0, isGroupRoom: true });

  const { groupRooms, setGroupRoomsFetched, updateGroupRooms } = appStore;

  useEffect(() => {
    updateGroupRooms();
    setGroupRoomsFetched(true);
  }, [updateGroupRooms, setGroupRoomsFetched]);

  const trendingGroupRooms = [...groupRooms]
    .sort((a, b) => {
      const zscoreA = parseFloat(a.room_data.zscore);
      const zscoreB = parseFloat(b.room_data.zscore);
      return zscoreB - zscoreA;
    })
    .slice(0, 5);

  const handleStartGroupChat = (windowData) => {
    history.push(`/chat/${RoomType.GROUP}/${windowData.roomId}`);
  };

  const handleStartChat = (room) => {
    const chatGroupRoom = room || selectedRoom;
    if (chatGroupRoom) {
      if (chatGroupRoom.id === -1) {
        newRoomName && history.push('/room', { name: newRoomName });
      } else {
        const windowData = {
          roomId: chatGroupRoom.id,
          isGroupRoom: true,
        };
        setChatWindowData(windowData);
        if (chatGroupRoom.room_data.is_protected) {
          setShouldOpenRoomPasswordDialog(true);
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
    setNewRoomName(pendingNewRoomName);
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
                      options: [newRoomOption, ...groupRooms],
                      onClose: handleGroupSearchClose,
                      inputValue: pendingNewRoomName,
                      getOptionLabel: (option) => {
                        if (option.id > 0) return option.name;
                        if (option.id === -1) return pendingNewRoomName;
                        return '';
                      },
                      noOptionsText: 'No room',
                      sx: { flex: 1 },
                    }}
                    value={selectedRoom}
                    setPendingValue={setPendingNewRoomName}
                    setValue={(newSelectedGroup) => {
                      if (!newSelectedGroup) {
                        setRoomAction('Create');
                        setSelectedRoom(null);
                      } else {
                        if (newSelectedGroup.id === -1) {
                          setRoomAction('Create');
                          if (!pendingNewRoomName) {
                            appStore.showAlert({
                              text: 'Room name cannot be empty',
                              severity: 'error',
                            });
                            setSelectedRoom(null);
                            return;
                          }
                        } else {
                          setRoomAction('Enter');
                        }
                        setSelectedRoom(newSelectedGroup);
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
                    disabled={!pendingNewRoomName || !selectedRoom}
                    onClick={(evt) => handleStartChat()}
                  >
                    {roomAction} Room
                  </Button>
                </Stack>
                {trendingGroupRooms.length > 0 && (
                  <TrendingGroupRooms
                    trendingGroupRooms={trendingGroupRooms}
                    onStartChat={handleStartChat}
                  />
                )}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <RoomPasswordDialog
        shouldOpenRoomPasswordDialog={shouldOpenRoomPasswordDialog}
        setShouldOpenRoomPasswordDialog={setShouldOpenRoomPasswordDialog}
        handleStartChat={handleStartGroupChat}
        chatWindowData={chatWindowData}
      />
    </>
  );
}

export default observer(GroupChatUI);
