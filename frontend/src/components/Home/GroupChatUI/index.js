import React, { useEffect, useState } from 'react';
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

const GroupChatUI = () => {
  const [groupRooms, setGroupRooms] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState({});

  useEffect(() => {
    fetch('/api/chat/groups').then((response) =>
      response.json().then((data) => {
        setGroupRooms(Object.values(data.results));
      })
    );
  }, []);

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
                        <ListItemText primary={option.name} secondary="34 members" />
                      </ListItem>
                    )}
                    getOptionLabel={(option) => option.name || ''}
                  />
                </Grid>
              </Box>
              <Grid item>
                <Box my={4}>
                  <Button color="secondary" variant="contained" size="medium">
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

export default GroupChatUI;
