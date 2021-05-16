import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Grid, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { ReactComponent as GroupChatImg } from 'assets/images/group_chat.svg';

const GroupChatUI = () => {
  const [groupRooms, setGroupRooms] = useState([]);
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
                    freeSolo
                    options={groupRooms.map((option) => option.name)}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...params}
                        label="Search/Create groups"
                        margin="normal"
                        variant="outlined"
                      />
                    )}
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
