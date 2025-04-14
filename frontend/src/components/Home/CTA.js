import React from 'react';
import { Box, Container, Typography, Button, Stack, useTheme } from '@mui/material';

function CTA() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: 12,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, ${theme.palette.primary.main}10 0%, transparent 50%)`,
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: 'center',
            maxWidth: 800,
            mx: 'auto',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              color: 'text.primary',
            }}
          >
            Ready to Start Chatting?
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              mb: 4,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
            }}
          >
            Join thousands of users already enjoying anonymous, secure conversations with exciting
            interactive features.
          </Typography>

          <Stack spacing={2} alignItems="center">
            <Button
              variant="contained"
              size="large"
              sx={{
                py: 2,
                px: 6,
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Start Chatting Now
            </Button>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontStyle: 'italic',
              }}
            >
              No signup. No subscription. Just chat.
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default CTA;
