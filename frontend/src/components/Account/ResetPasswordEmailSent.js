import React from 'react';
import { Typography } from '@mui/material';
import CenterPaper from 'components/CenterPaper';

function ResetPasswordEmailSent() {
  return (
    <CenterPaper>
      <Typography variant="h6">
        We have sent an e-mail to you to reset your account password. Please check your inbox.
      </Typography>
    </CenterPaper>
  );
}

export default ResetPasswordEmailSent;
