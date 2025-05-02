import React from 'react';
import { Box, Container, Typography, Button, Stack, useTheme } from '@mui/material';
import { useChatLauncher } from 'hooks';

function CTA() {
  const theme = useTheme();
  const launchChat = useChatLauncher();
  return (
    <Box
      id="cta"
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
            variant="h3"
            sx={{
              fontWeight: theme.typography.fontWeightBold,
              mb: 2,
            }}
          >
            Ready to Start Chatting?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              fontWeight: theme.typography.fontWeightRegular,
            }}
          >
            Join thousands of users already enjoying anonymous, secure conversations with exciting
            interactive features.
          </Typography>

          <Stack spacing={2} alignItems="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => launchChat()}
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
