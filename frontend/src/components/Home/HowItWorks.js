import React from 'react';
import { Box, Container, Typography, Stack, useTheme, useMediaQuery } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import BoltIcon from '@mui/icons-material/Bolt';
import MovieIcon from '@mui/icons-material/Movie';
import BrushIcon from '@mui/icons-material/Brush';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import SecurityIcon from '@mui/icons-material/Security';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

function HowItWorks() {
  const theme = useTheme();

  const steps = [
    {
      id: 'step-1',
      title: 'Choose Your Chat Mode',
      description: 'Select between one-on-one chat or join a group chat room based on your interests.',
    },
    {
      id: 'step-2',
      title: 'Start Chatting',
      description: 'Begin your conversation in a secure, end-to-end encrypted environment.',
    },
    {
      id: 'step-3',
      title: 'Enjoy Additional Features',
      description: 'Watch videos together, play games, or collaborate on drawings while chatting.',
    },
  ];

  return (
    <Box
      id="how-it-works"
      sx={{
        py: 12,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={8} alignItems="center">
          {/* Section Header */}
          <Box sx={{ textAlign: 'center', maxWidth: 800 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                color: 'text.primary',
              }}
            >
              How It Works
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'text.secondary',
                mb: 4,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
              }}
            >
              Getting started with Mysterio is quick and easy. No accounts, no hassle.
            </Typography>
          </Box>

          {/* Process Steps */}
          <Box sx={{ width: '100%' }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={{ xs: 4, md: 0 }}
              justifyContent="space-between"
              alignItems="flex-start"
            >
              {steps.map((step, index) => (
                <Box
                  key={step.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    position: 'relative',
                    width: { xs: '100%', md: '30%' },
                  }}
                >
                  {/* Step Number */}
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 8px 24px ${step.color}40`,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '2rem',
                      }}
                    >
                      {index + 1}
                    </Typography>
                  </Box>

                  {/* Content */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        mb: 1,
                      }}
                    >
                      {step.title}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.secondary',
                        mb: 2,
                      }}
                    >
                      {step.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Testimonial Quote */}
          <Box
            sx={{
              mt: 8,
              maxWidth: 800,
              textAlign: 'center',
              position: 'relative',
              p: 4,
              borderRadius: 4,
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 40,
                height: 40,
                background: 'white',
                borderRadius: '50%',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            }}
          >
            <FormatQuoteIcon
              sx={{
                position: 'absolute',
                top: -15,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 24,
                color: 'primary.main',
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontStyle: 'italic',
                color: 'text.primary',
                mb: 2,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                lineHeight: 1.6,
              }}
            >
              "Mysterio provides the perfect balance of anonymity and rich features. It's my go-to
              platform for meeting new people."
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
              — Anonymous User
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

export default HowItWorks;
