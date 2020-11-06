import React from 'react';
import { Box, CssBaseline } from '@material-ui/core';
import { NavBar, Home, Footer } from 'components';
import './index.css';

const App = () => (
  <CssBaseline>
    <Box className="App">
      <NavBar />
      <Home />
      <Footer />
    </Box>
  </CssBaseline>
);

export default App;
