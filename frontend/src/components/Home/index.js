import React from 'react';
import { Divider, Grid } from '@material-ui/core';
import Jumbotron from './Jumbotron';
import Features from './Features';
import Contributors from './Contributors';
import GroupChatUI from './GroupChatUI';

function Home() {
  return (
    <Grid container direction="column">
      <Grid item>
        <Jumbotron />
      </Grid>
      <Grid item>
        <GroupChatUI />
      </Grid>
      <Grid item>
        <Features />
      </Grid>
      <Divider />
      <Grid item>
        <Contributors />
      </Grid>
    </Grid>
  );
}

export default Home;
