import React from 'react';
import { Box, CssBaseline, makeStyles } from '@material-ui/core';
import { NavBar, Home, Footer, ChatContainer } from 'components';

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
}));

const App = () => {
  const classes = useStyles();
  return (
    <CssBaseline>
      <Box className={classes.root}>
        <NavBar />
        <Home />
        <Footer />
        <ChatContainer />
      </Box>
    </CssBaseline>
  );
};

export default App;
