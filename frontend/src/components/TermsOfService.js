import React from 'react';
import { Box, Container, Typography, Paper, Stack, Divider, List, ListItem } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import SecurityIcon from '@mui/icons-material/Security';
import WarningIcon from '@mui/icons-material/Warning';
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
  listItem: {
    display: 'list-item',
    listStyleType: 'disc',
    marginLeft: theme.spacing(4),
  },
}));

function TermsOfService() {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4 }}>
          <Stack spacing={6}>
            {/* Header */}
            <Box textAlign="center">
              <Typography variant="h3" gutterBottom>
                Terms of Service
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Last Updated: {new Date().toLocaleDateString()}
              </Typography>
            </Box>

            {/* Introduction */}
            <Box className={classes.section}>
              <Typography variant="body1" paragraph>
                Welcome to Mysterio. By accessing or using our platform, you agree to be bound by
                these Terms of Service. Please read them carefully before using our services.
              </Typography>
            </Box>

            {/* Acceptance of Terms */}
            <Box className={classes.section}>
              <Box className={classes.sectionTitle}>
                <GavelIcon className={classes.icon} />
                <Typography variant="h4">Acceptance of Terms</Typography>
              </Box>
              <Stack spacing={2}>
                <Typography variant="body1">
                  By accessing or using Mysterio, you agree to:
                </Typography>
                <List>
                  <ListItem className={classes.listItem}>
                    <Typography variant="body1">
                      Comply with all applicable laws and regulations
                    </Typography>
                  </ListItem>
                  <ListItem className={classes.listItem}>
                    <Typography variant="body1">
                      Respect the privacy and rights of other users
                    </Typography>
                  </ListItem>
                  <ListItem className={classes.listItem}>
                    <Typography variant="body1">
                      Use the service only for lawful purposes
                    </Typography>
                  </ListItem>
                </List>
              </Stack>
            </Box>

            {/* User Conduct */}
            <Box className={classes.section}>
              <Box className={classes.sectionTitle}>
                <WarningIcon className={classes.icon} />
                <Typography variant="h4">User Conduct</Typography>
              </Box>
              <Stack spacing={2}>
                <Typography variant="body1">Users are prohibited from:</Typography>
                <List>
                  <ListItem className={classes.listItem}>
                    <Typography variant="body1">
                      Harassing, threatening, or intimidating other users
                    </Typography>
                  </ListItem>
                  <ListItem className={classes.listItem}>
                    <Typography variant="body1">
                      Sharing explicit or inappropriate content
                    </Typography>
                  </ListItem>
                  <ListItem className={classes.listItem}>
                    <Typography variant="body1">
                      Attempting to compromise the security of the platform
                    </Typography>
                  </ListItem>
                  <ListItem className={classes.listItem}>
                    <Typography variant="body1">
                      Using automated systems to access the service
                    </Typography>
                  </ListItem>
                </List>
              </Stack>
            </Box>

            {/* Privacy and Security */}
            <Box className={classes.section}>
              <Box className={classes.sectionTitle}>
                <SecurityIcon className={classes.icon} />
                <Typography variant="h4">Privacy and Security</Typography>
              </Box>
              <Stack spacing={2}>
                <Typography variant="body1">
                  Our commitment to your privacy and security:
                </Typography>
                <List>
                  <ListItem className={classes.listItem}>
                    <Typography variant="body1">
                      We implement industry-standard security measures
                    </Typography>
                  </ListItem>
                  <ListItem className={classes.listItem}>
                    <Typography variant="body1">
                      We do not store personal information beyond what is necessary
                    </Typography>
                  </ListItem>
                  <ListItem className={classes.listItem}>
                    <Typography variant="body1">
                      We use end-to-end encryption for all communications
                    </Typography>
                  </ListItem>
                </List>
              </Stack>
            </Box>

            {/* Intellectual Property */}
            <Box className={classes.section}>
              <Typography variant="h5" gutterBottom>
                Intellectual Property
              </Typography>
              <Typography variant="body1" paragraph>
                All content, features, and functionality of Mysterio are owned by us and are
                protected by international copyright, trademark, and other intellectual property
                laws.
              </Typography>
            </Box>

            {/* Limitation of Liability */}
            <Box className={classes.section}>
              <Typography variant="h5" gutterBottom>
                Limitation of Liability
              </Typography>
              <Typography variant="body1" paragraph>
                Mysterio is provided &quot;as is&quot; without any warranties, express or implied.
                We shall not be liable for any indirect, incidental, special, consequential, or
                punitive damages resulting from your use of the service.
              </Typography>
            </Box>

            {/* Changes to Terms */}
            <Box className={classes.section}>
              <Typography variant="h5" gutterBottom>
                Changes to Terms
              </Typography>
              <Typography variant="body1" paragraph>
                We reserve the right to modify these terms at any time. We will notify users of any
                material changes through our platform. Continued use of the service after such
                changes constitutes acceptance of the new terms.
              </Typography>
            </Box>

            <Divider />

            {/* Contact */}
            <Box className={classes.section}>
              <Typography variant="h5" gutterBottom>
                Contact Us
              </Typography>
              <Typography variant="body1">
                If you have any questions about these Terms of Service, please contact us at
                support@mysterio.com.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default TermsOfService;
