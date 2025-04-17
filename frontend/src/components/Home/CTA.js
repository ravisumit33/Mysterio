import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';

function CTA() {
  return (
    <Box
      sx={{
        py: 12,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'secondary.main',
        color: 'secondary.contrastText',
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
            }}
          >
            Ready to Start Chatting?
          </Typography>
          <Typography
            variant="h5"
            sx={{
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
                bgcolor: 'background.paper',
                color: 'secondary.main',
                py: 2,
                '&:hover': {
                  bgcolor: 'grey.300',
                },
              }}
            >
              Start Chatting Now
            </Button>
            <Typography
              variant="body2"
              sx={{
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
