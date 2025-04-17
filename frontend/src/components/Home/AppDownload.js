import React from 'react';
import { Box, Container, Typography, Stack, Button, useTheme } from '@mui/material';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';
import { keyframes } from '@emotion/react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import SendIcon from '@mui/icons-material/Send';
import CallIcon from '@mui/icons-material/Call';
import VideocamIcon from '@mui/icons-material/Videocam';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';

// Animation keyframes
const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const typingAnimation = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
`;

function AppDownload() {
  const theme = useTheme();
  return (
    <Box
      id="app-download"
      sx={{
        py: 12,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        scrollMarginTop: (tm) => tm.mixins.toolbar.minHeight,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={6}
          alignItems="center"
          justifyContent="center"
        >
          {/* Content */}
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: theme.typography.fontWeightBold,
                mb: 2,
              }}
            >
              Get Mysterio on Your Device
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                color: 'grey.200',
                fontWeight: theme.typography.fontWeightRegular,
              }}
            >
              Take anonymous chatting with you where ever you go. Download the app and start
              connecting with people instantly. Available for both iOS and Android devices.
            </Typography>

            {/* App Store Buttons */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                justifyContent: { xs: 'center', md: 'flex-start' },
                alignItems: { xs: 'center', md: 'flex-start' },
                mt: 4,
              }}
            >
              <Button
                variant="contained"
                size="medium"
                startIcon={<AppleIcon sx={{ fontSize: 40 }} />}
                sx={{
                  py: 2,
                  px: 4,
                  borderRadius: 2,
                  bgcolor: 'black',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.8)',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 0.5,
                  }}
                >
                  <Typography variant="caption" sx={{ lineHeight: 1 }}>
                    Download on the
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: theme.typography.fontWeightBold, lineHeight: 1 }}
                  >
                    App Store
                  </Typography>
                </Box>
              </Button>
              <Button
                variant="contained"
                size="medium"
                startIcon={<AndroidIcon sx={{ fontSize: 40 }} />}
                sx={{
                  py: 2,
                  px: 4,
                  borderRadius: 2,
                  bgcolor: 'success.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'success.dark',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 0.5,
                  }}
                >
                  <Typography variant="caption" sx={{ lineHeight: 1 }}>
                    Get it on
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: theme.typography.fontWeightBold, lineHeight: 1 }}
                  >
                    Google Play
                  </Typography>
                </Box>
              </Button>
            </Stack>
          </Box>

          {/* Illustration */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              minHeight: { xs: 300, md: 400 },
            }}
          >
            <Box
              component="svg"
              viewBox="0 0 500 500"
              sx={{
                width: '100%',
                height: '100%',
                maxWidth: 500,
                maxHeight: 500,
                animation: `${floatAnimation} 6s ease-in-out infinite`,
              }}
            >
              {/* Phone Frame */}
              <rect
                x="50"
                y="50"
                width="400"
                height="600"
                rx="40"
                fill="#1a1a1a"
                stroke="#333"
                strokeWidth="2"
                filter="url(#shadow)"
              />

              {/* Screen Content */}
              <rect x="70" y="70" width="360" height="560" rx="30" fill="#f5f5f5" />

              {/* Chat Header */}
              <rect x="70" y="70" width="360" height="60" rx="30" fill="#ffffff" />

              {/* User Avatar */}
              <circle cx="100" cy="100" r="20" fill="url(#avatarGradient)" />

              {/* User Info */}
              <text x="130" y="95" fill="#333" fontSize="14" fontWeight="bold">
                John
              </text>
              <text
                x="130"
                y="115"
                fill="#666"
                fontSize="12"
                style={{ animation: `${typingAnimation} 2s infinite` }}
              >
                typing...
              </text>

              {/* Header Icons */}
              <g fill="#666">
                <CallIcon x="260" y="90" width="20" height="20" />
                <VideocamIcon x="290" y="90" width="20" height="20" />
                <PlayCircleFilledIcon x="320" y="90" width="20" height="20" />
                <MoreVertIcon x="350" y="90" width="20" height="20" />
                <CloseIcon x="380" y="90" width="20" height="20" />
              </g>

              {/* Chat Messages */}
              <g>
                {/* Received Message */}
                <rect x="80" y="150" width="240" height="40" rx="20" fill="#e0e0e0" />
                <text
                  x="200"
                  y="170"
                  fill="#333"
                  fontSize="12"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  Hey there! How are you doing?
                </text>

                {/* Sent Message */}
                <rect x="180" y="210" width="240" height="40" rx="20" fill="#2196f3" />
                <text
                  x="300"
                  y="230"
                  fill="white"
                  fontSize="12"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  I&apos;m good! Just exploring Mysterio
                </text>
              </g>

              {/* Input Area */}
              <rect x="70" y="580" width="360" height="50" rx="25" fill="#ffffff" />

              {/* Input Icons */}
              <g fill="#666">
                <AttachFileIcon x="80" y="590" width="20" height="20" />
                <EmojiEmotionsIcon x="410" y="590" width="20" height="20" />
                <SendIcon x="440" y="590" width="20" height="20" />
              </g>

              {/* Input Text */}
              <text x="110" y="610" fill="#666" fontSize="12">
                Type a message...
              </text>

              {/* Definitions */}
              <defs>
                <linearGradient id="avatarGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2196f3" />
                  <stop offset="100%" stopColor="#4caf50" />
                </linearGradient>

                <filter id="shadow">
                  <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="rgba(0,0,0,0.3)" />
                </filter>
              </defs>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

export default AppDownload;
