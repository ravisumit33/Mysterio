import React from 'react';
import PropTypes from 'prop-types';
import { Box, Container, Paper } from '@mui/material';

function CenterPaper(props) {
  const { children } = props;
  return (
    <Box my={3}>
      <Container maxWidth="sm">
        <Paper variant="elevation" elevation={2}>
          <Box p={3}>{children}</Box>
        </Paper>
      </Container>
    </Box>
  );
}

CenterPaper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CenterPaper;
