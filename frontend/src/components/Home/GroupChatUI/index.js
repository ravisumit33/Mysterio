import React from 'react';
import { Box, Container, Grid } from '@material-ui/core';
import { ReactComponent as GroupChatImg } from 'assets/images/group_chat.svg';

const GroupChatUI = () => (
  <Box>
    <Container>
      <Grid container justify="space-between" spacing={2}>
        <Grid item xs={12} md={6}>
          <Box py={2}>
            <GroupChatImg width="100%" height="400" />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          Trending Group
        </Grid>
      </Grid>
    </Container>
  </Box>
);

export default GroupChatUI;
