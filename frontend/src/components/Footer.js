import React from 'react';
import { Box, Container, Grid, Typography, Link, Stack, IconButton, useTheme } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { Link as RouterLink } from 'react-router-dom';

function Footer() {
  const theme = useTheme();
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        bgcolor: 'grey.900',
        color: 'grey.50',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          {/* Logo and About Section */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h4"
              sx={{
                mb: 2,
                fontWeight: theme.typography.fontWeightBold,
                letterSpacing: '1px',
              }}
            >
              MYSTERIO
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Connect with strangers in a safe, anonymous environment. Chat, play games, and make
              new friends.
            </Typography>
            <Stack direction="row" justifyContent={{ xs: 'center', sm: 'flex-start' }} spacing={1}>
              <IconButton
                color="inherit"
                href="https://github.com/yourusername/mysterio"
                target="_blank"
              >
                <GitHubIcon />
              </IconButton>
              <IconButton color="inherit" href="https://twitter.com/mysteriochat" target="_blank">
                <TwitterIcon />
              </IconButton>
              <IconButton
                color="inherit"
                href="https://linkedin.com/company/mysterio"
                target="_blank"
              >
                <LinkedInIcon />
              </IconButton>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Stack spacing={1}>
              <Link component={RouterLink} to="/" color="inherit" underline="hover">
                Home
              </Link>
              <Link component={RouterLink} to="/features" color="inherit" underline="hover">
                Features
              </Link>
              <Link component={RouterLink} to="/how-it-works" color="inherit" underline="hover">
                How It Works
              </Link>
              <Link component={RouterLink} to="/faq" color="inherit" underline="hover">
                FAQ
              </Link>
            </Stack>
          </Grid>

          {/* Legal */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Legal
            </Typography>
            <Stack spacing={1}>
              <Link component={RouterLink} to="/privacy" color="inherit" underline="hover">
                Privacy Policy
              </Link>
              <Link component={RouterLink} to="/terms" color="inherit" underline="hover">
                Terms of Service
              </Link>
              <Link component={RouterLink} to="/cookies" color="inherit" underline="hover">
                Cookie Policy
              </Link>
            </Stack>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <Stack spacing={1}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent={{ xs: 'center', sm: 'flex-start' }}
              >
                <EmailIcon fontSize="small" />
                <Link href="mailto:support@mysterio-chat.com" color="inherit" underline="hover">
                  support@mysterio-chat.com
                </Link>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'grey.700' }}>
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} Mysterio Chat. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
