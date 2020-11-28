import React from 'react';
import { Box, CssBaseline } from '@material-ui/core';
import { NavBar, Home, Footer, ChatContainer } from 'components';
import * as stores from 'stores';
import './index.css';

const App = () => {
  stores.initStores(stores);
  return (
    <CssBaseline>
      <Box className="App">
        <NavBar />
        <Home />
        <Footer />
        <ChatContainer />
      </Box>
    </CssBaseline>
  );
};

export default App;
