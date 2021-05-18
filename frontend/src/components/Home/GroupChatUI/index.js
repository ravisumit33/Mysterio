import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Button,
  Container,
  Grid,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { ReactComponent as GroupChatImg } from 'assets/images/group_chat.svg';
import { TextAvatar } from 'components/Avatar';
import { chatContainerStore, profileStore, userInfoDialogStore } from 'stores';
import { fetchUrl, getCookie } from 'utils';

const GroupChatUI = () => {
  const [groupRooms, setGroupRooms] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState({ id: -1, name: '' });
  const [newGroupName, setNewGroupName] = useState('');
  const [pendingNewGroupName, setPendingNewGroupName] = useState('');

  useEffect(() => {
    fetchUrl('/api/chat/groups').then((data) => setGroupRooms(Object.values(data)));
  }, []);

  const handleStartGroupChat = (chatWindowData) => {
    if (profileStore.name) {
      chatContainerStore.addChatWindow(chatWindowData);
    } else {
      userInfoDialogStore.setChatWindowData(chatWindowData);
      userInfoDialogStore.setShouldOpen(true);
    }
  };

  const handleStartChat = () => {
    let chatWindowData;
    if (selectedGroup && selectedGroup.id !== -1) {
      chatWindowData = {
        roomId: selectedGroup.id,
        name: selectedGroup.name,
      };
      handleStartGroupChat(chatWindowData);
    } else if (newGroupName) {
      fetchUrl('/api/chat/groups/', {
        method: 'post',
        credentials: 'same-origin',
        headers: {
          'X-CSRFToken': getCookie('csrftoken'),
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newGroupName }),
      }).then((data) => {
        chatWindowData = {
          roomId: data.id,
          name: data.name,
        };
        handleStartGroupChat(chatWindowData);
      });
    }
  };

  const handleGroupSearchClose = (event, reason) => {
    if (reason === 'toggleInput') {
      return;
    }
    setNewGroupName(pendingNewGroupName);
  };

  return (
    <Box>
      <Container>
        <Grid container justify="space-between" spacing={2}>
          <Grid item xs={12} md={6}>
            <Box py={2}>
              <GroupChatImg width="100%" height="400" />
            </Box>
          </Grid>
          <Grid item container xs={12} md={6} justify="center">
            <Grid item container xs={12} spacing={2} justify="center">
              <Box width="50%" my={3}>
                <Grid item>
                  <Autocomplete
                    id="Groups-Search-Box"
                    options={groupRooms}
                    noOptionsText="New group will be created"
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
                        label="Search/Create groups"
                        margin="normal"
                        variant="outlined"
                      />
                    )}
                    renderOption={(option) => (
                      <ListItem disableGutters>
                        <ListItemAvatar>
                          <TextAvatar name={option.name} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={option.name}
                          secondary={`${option.group_messages.length} messages`}
                        />
                      </ListItem>
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
                    onClick={handleStartChat}
                  >
                    Enter Group
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default observer(GroupChatUI);
