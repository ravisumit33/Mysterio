import React from 'react';
import { Divider, Stack } from '@mui/material';
import Jumbotron from './Jumbotron';
import Features from './Features';
import Contributors from './Contributors';
import GroupChatUI from './GroupChatUI';

function Home() {
  return (
    <Stack divider={<Divider flexItem />}>
      <Jumbotron />
      <GroupChatUI />
      <Features />
      <Contributors />
    </Stack>
  );
}

export default Home;
