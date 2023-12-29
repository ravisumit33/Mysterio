import React from 'react';
import { Box, CssBaseline, Stack } from '@mui/material';
import CenterPaper from 'components/CenterPaper';
import Notification from 'components/Notification';
import warningJson from 'assets/animations/warning.json';
import { grey } from '@mui/material/colors';

function ErrorUI() {
  return (
    <CssBaseline>
      <Box sx={{ height: '100vh', backgroundColor: grey[400], p: 1 }}>
        <CenterPaper>
          <Stack justifyContent="space-around" spacing={2} sx={{ pb: 5 }}>
            <Notification
              animationProps={{
                containerId: 'warning',
                animationData: warningJson,
                loop: false,
              }}
              title="Something went wrong :("
              description="Try again after some time."
            />
          </Stack>
        </CenterPaper>
      </Box>
    </CssBaseline>
  );
}

export default ErrorUI;
