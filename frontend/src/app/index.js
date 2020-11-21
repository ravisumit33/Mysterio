import React from 'react';
import { Box, CssBaseline } from '@material-ui/core';
import { NavBar, Home, Footer, ChatContainer } from 'components';
import './index.css';

const App = () => (
  <CssBaseline>
    <Box className="App">
      <NavBar />
      <Home />
      <Footer />
      <ChatContainer />
    </Box>
  </CssBaseline>
);

export default App;
