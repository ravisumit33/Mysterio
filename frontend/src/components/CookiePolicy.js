import React from 'react';
import { Box, Container, Typography, Paper, Stack, Divider, List, ListItem } from '@mui/material';
import CookieIcon from '@mui/icons-material/Cookie';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
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

function CookiePolicy() {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4 }}>
          <Stack spacing={6}>
            {/* Header */}
            <Box textAlign="center">
              <Typography variant="h3" gutterBottom>
                Cookie Policy
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Last Updated: {new Date().toLocaleDateString()}
              </Typography>
            </Box>

            {/* Introduction */}
            <Box className={classes.section}>
              <Typography variant="body1" paragraph>
                This Cookie Policy explains how Mysterio uses cookies and similar technologies to
                recognize you when you visit our website. It explains what these technologies are
                and why we use them, as well as your rights to control our use of them.
              </Typography>
            </Box>

            {/* What are Cookies */}
            <Box className={classes.section}>
              <Box className={classes.sectionTitle}>
                <CookieIcon className={classes.icon} />
                <Typography variant="h4">What are Cookies?</Typography>
              </Box>
              <Stack spacing={2}>
                <Typography variant="body1">
                  Cookies are small data files that are placed on your computer or mobile device
                  when you visit a website. Cookies are widely used by website owners to make their
                  websites work, or to work more efficiently, as well as to provide reporting
                  information.
                </Typography>
                <Typography variant="body1">
                  Cookies set by the website owner (in this case, Mysterio) are called
                  &quot;first-party cookies&quot;. Cookies set by parties other than the website
                  owner are called &quot;third-party cookies&quot;.
                </Typography>
              </Stack>
            </Box>

            {/* Why do we use Cookies */}
            <Box className={classes.section}>
              <Box className={classes.sectionTitle}>
                <SettingsIcon className={classes.icon} />
                <Typography variant="h4">Why do we use Cookies?</Typography>
              </Box>
              <Stack spacing={2}>
                <Typography variant="body1">We use cookies for several reasons:</Typography>
                <List>
                  <ListItem className={classes.listItem}>
                    <Typography variant="body1">
                      Essential cookies: Required for the website to function properly
                    </Typography>
                  </ListItem>
                  <ListItem className={classes.listItem}>
                    <Typography variant="body1">
                      Performance cookies: Help us understand how visitors interact with our website
                    </Typography>
                  </ListItem>
                  <ListItem className={classes.listItem}>
                    <Typography variant="body1">
                      Functionality cookies: Enable enhanced functionality and personalization
                    </Typography>
                  </ListItem>
                  <ListItem className={classes.listItem}>
                    <Typography variant="body1">
                      Analytics cookies: Help us understand how our website is being used
                    </Typography>
                  </ListItem>
                </List>
              </Stack>
            </Box>

            {/* Types of Cookies We Use */}
            <Box className={classes.section}>
              <Typography variant="h5" gutterBottom>
                Types of Cookies We Use
              </Typography>
              <Stack spacing={2}>
                <Typography variant="body1">
                  <span className={classes.highlight}>Essential Cookies:</span> These cookies are
                  strictly necessary to provide you with services available through our website and
                  to use some of its features.
                </Typography>
                <Typography variant="body1">
                  <span className={classes.highlight}>Performance Cookies:</span> These cookies are
                  used to enhance the performance and functionality of our website but are
                  non-essential to their use.
                </Typography>
                <Typography variant="body1">
                  <span className={classes.highlight}>Analytics Cookies:</span> These cookies help
                  us understand how visitors interact with our website by collecting and reporting
                  information anonymously.
                </Typography>
              </Stack>
            </Box>

            {/* Cookie Management */}
            <Box className={classes.section}>
              <Box className={classes.sectionTitle}>
                <SecurityIcon className={classes.icon} />
                <Typography variant="h4">Cookie Management</Typography>
              </Box>
              <Stack spacing={2}>
                <Typography variant="body1">
                  You have the right to decide whether to accept or reject cookies. You can exercise
                  your cookie preferences by:
                </Typography>
                <List>
                  <ListItem className={classes.listItem}>
                    <Typography variant="body1">
                      Adjusting your browser settings to block or delete cookies
                    </Typography>
                  </ListItem>
                  <ListItem className={classes.listItem}>
                    <Typography variant="body1">
                      Using privacy-focused browser extensions
                    </Typography>
                  </ListItem>
                </List>
              </Stack>
            </Box>

            <Divider />

            {/* Contact */}
            <Box className={classes.section}>
              <Typography variant="h5" gutterBottom>
                Contact Us
              </Typography>
              <Typography variant="body1">
                If you have any questions about our use of cookies, please contact us at
                support@mysterio.com.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default CookiePolicy;
