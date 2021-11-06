import React from 'react';
import { Typography } from '@material-ui/core';
import CenterPaper from 'components/CenterPaper';

const ConfirmationEmailSent = () => (
  <CenterPaper>
    <Typography variant="h6">
      We have sent an e-mail to you for verification. Please check your inbox.
    </Typography>
  </CenterPaper>
);

export default ConfirmationEmailSent;
