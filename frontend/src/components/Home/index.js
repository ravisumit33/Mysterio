import React from 'react';
import { Box, Divider, Grid } from '@material-ui/core';
import Jumbotron from './Jumbotron';
import Features from './Features';
import Contributors from './Contributors';

const Home = () => (
  <Box>
    <Grid container direction="column">
      <Grid item>
        <Jumbotron />
      </Grid>
      <Grid item>
        <Features />
      </Grid>
      <Divider />
      <Grid item>
        <Contributors />
      </Grid>
    </Grid>
  </Box>
);

export default Home;
