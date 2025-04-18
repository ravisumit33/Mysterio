import React from 'react';
import { Box, Container, Typography, Paper, Stack, Divider } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(8, 0),
    backgroundColor: theme.palette.background.default,
  },
  section: {
    marginBottom: theme.spacing(6),
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  icon: {
    color: theme.palette.primary.main,
    fontSize: '2rem',
  },
  highlight: {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightBold,
  },
}));

function PrivacyPolicy() {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4 }}>
          <Stack spacing={6}>
            {/* Header */}
            <Box textAlign="center">
              <Typography variant="h3" gutterBottom>
                Privacy Policy
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Last Updated: {new Date().toLocaleDateString()}
              </Typography>
            </Box>

            {/* Introduction */}
            <Box className={classes.section}>
              <Typography variant="body1" paragraph>
                At Mysterio, we are committed to protecting your privacy and ensuring the security
                of your personal information. This Privacy Policy outlines how we collect, use, and
                safeguard your data when you use our anonymous chat platform.
              </Typography>
            </Box>

            {/* Data Collection */}
            <Box className={classes.section}>
              <Box className={classes.sectionTitle}>
                <SecurityIcon className={classes.icon} />
                <Typography variant="h4">Data Collection</Typography>
              </Box>
              <Stack spacing={2}>
                <Typography variant="body1">
                  We collect minimal information necessary to provide our services:
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body1">
                      <span className={classes.highlight}>Anonymous Identifiers:</span> Randomly
                      generated session IDs for chat functionality
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      <span className={classes.highlight}>Technical Data:</span> Device information,
                      browser type, and IP address for security purposes
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      <span className={classes.highlight}>Usage Data:</span> Chat patterns and
                      feature usage for service improvement
                    </Typography>
                  </li>
                </ul>
              </Stack>
            </Box>

            {/* Data Protection */}
            <Box className={classes.section}>
              <Box className={classes.sectionTitle}>
                <LockIcon className={classes.icon} />
                <Typography variant="h4">Data Protection</Typography>
              </Box>
              <Stack spacing={2}>
                <Typography variant="body1">
                  We implement industry-standard security measures:
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body1">
                      <span className={classes.highlight}>End-to-End Encryption:</span> All messages
                      are encrypted in transit and at rest
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      <span className={classes.highlight}>Secure Storage:</span> Data is stored in
                      secure, encrypted databases
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      <span className={classes.highlight}>Regular Audits:</span> Security systems
                      are regularly tested and updated
                    </Typography>
                  </li>
                </ul>
              </Stack>
            </Box>

            {/* Data Usage */}
            <Box className={classes.section}>
              <Box className={classes.sectionTitle}>
                <VerifiedUserIcon className={classes.icon} />
                <Typography variant="h4">Data Usage</Typography>
              </Box>
              <Stack spacing={2}>
                <Typography variant="body1">Your data is used exclusively for:</Typography>
                <ul>
                  <li>
                    <Typography variant="body1">
                      <span className={classes.highlight}>Service Provision:</span> Delivering and
                      maintaining chat functionality
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      <span className={classes.highlight}>Security:</span> Preventing abuse and
                      ensuring platform safety
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      <span className={classes.highlight}>Improvement:</span> Enhancing user
                      experience and service quality
                    </Typography>
                  </li>
                </ul>
              </Stack>
            </Box>

            {/* Data Retention */}
            <Box className={classes.section}>
              <Typography variant="h5" gutterBottom>
                Data Retention
              </Typography>
              <Typography variant="body1" paragraph>
                We retain your data only for as long as necessary to provide our services. Chat
                messages are automatically deleted after the session ends, and no personal
                information is stored beyond what is required for security and functionality.
              </Typography>
            </Box>

            {/* User Rights */}
            <Box className={classes.section}>
              <Typography variant="h5" gutterBottom>
                Your Rights
              </Typography>
              <Typography variant="body1" paragraph>
                As a user of Mysterio, you have the right to:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body1">
                    Access any personal data we hold about you
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">Request deletion of your data</Typography>
                </li>
                <li>
                  <Typography variant="body1">Opt-out of data collection where possible</Typography>
                </li>
              </ul>
            </Box>

            {/* Contact */}
            <Box className={classes.section}>
              <Typography variant="h5" gutterBottom>
                Contact Us
              </Typography>
              <Typography variant="body1">
                If you have any questions about this Privacy Policy or our data practices, please
                contact us at support@mysterio.com.
              </Typography>
            </Box>

            <Divider />

            {/* Footer */}
            <Typography variant="body2" color="text.secondary" align="center">
              This Privacy Policy is subject to change. We will notify users of any material changes
              through our platform.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default PrivacyPolicy;
