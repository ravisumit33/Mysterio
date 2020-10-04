import React from 'react';
import { Box, CssBaseline } from '@material-ui/core';
import { NavBar, Home, Footer } from 'components';
import './index.css';

class App extends React.Component {
  render() {
    return (
      <CssBaseline>
        <Box className="App">
          <NavBar />
          <Home />
          <Footer />
        </Box>
      </CssBaseline>
    );
  }
}

export default App;
