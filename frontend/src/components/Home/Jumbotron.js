import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Button,
  CardMedia,
  Stack,
  Typography,
  Chip,
  Container,
  IconButton,
  Grid,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import GroupIcon from '@mui/icons-material/Group';
import SecurityIcon from '@mui/icons-material/Security';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTheme } from '@mui/material/styles';
import JumbotronBG from 'assets/images/jumbotron_bg.webp';
import { useConstant } from 'hooks';

function Jumbotron() {
  const history = useHistory();
  const theme = useTheme();
  const [showArrow, setShowArrow] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(theme.mixins.toolbar.minHeight);
  const jumbotronRef = useRef(null);
  const initialViewPortHeight = useConstant(() => window.innerHeight);

  useEffect(() => {
    const checkHeight = () => {
      if (jumbotronRef.current) {
        const jumbotronRect = jumbotronRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const headerElement = document.querySelector('header');

        // Use header height if found, otherwise fallback to toolbar minHeight
        setHeaderHeight(headerElement?.offsetHeight || theme.mixins.toolbar.minHeight);

        // Show arrow only when jumbotron fills viewport and is at the top
        setShowArrow(
          jumbotronRect.height >= viewportHeight && Math.abs(jumbotronRect.top) < 50 // Allow small scroll tolerance
        );
      }
    };

    // Check initially
    checkHeight();

    // Check on resize and scroll
    window.addEventListener('resize', checkHeight);
    window.addEventListener('scroll', checkHeight);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkHeight);
      window.removeEventListener('scroll', checkHeight);
    };
  }, [theme.mixins.toolbar.minHeight]);

  const handleStartIndividualChat = () => {
    history.push('/chat/match/');
  };

  const handleExploreRooms = () => {
    history.push('/rooms');
  };

  const handleArrowClick = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <Box
      ref={jumbotronRef}
      id="jumbotron"
      sx={{
        position: 'relative',
        minHeight: initialViewPortHeight,
        height: initialViewPortHeight,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Background Image */}
      <CardMedia
        component="img"
        image={JumbotronBG}
        alt="Jumbotron Background"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />
      {/* Subtle Dark Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0, 0, 0, 0.35)',
          zIndex: 0,
        }}
      />

      {/* Content */}
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        {/* Center content wrapper */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            my: `${headerHeight}px`,
          }}
        >
          <Stack
            spacing={4}
            alignItems="center"
            sx={{
              bgcolor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(8px)',
              p: { xs: 3, md: 6 },
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              width: '100%',
            }}
          >
            {/* Main Text */}
            <Stack spacing={2} alignItems="center">
              <Typography
                variant="h2"
                align="center"
                sx={{
                  fontWeight: theme.typography.fontWeightBold,
                  color: 'common.white',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                Connect Anonymously,
                <br />
                <Box component="span" sx={{ color: 'common.white' }}>
                  Chat Freely
                </Box>
              </Typography>

              <Container maxWidth="md">
                <Typography
                  variant="h6"
                  align="center"
                  sx={{
                    fontWeight: theme.typography.fontWeightRegular,
                    display: { xs: 'none', sm: 'block' },
                    color: 'grey.100',
                    opacity: 0.9,
                  }}
                >
                  Experience the freedom of authentic conversations in a secure environment. Join
                  thousands of users worldwide in meaningful discussions without revealing your
                  identity.
                </Typography>
              </Container>
            </Stack>

            {/* Feature Chips */}
            <Grid container spacing={2} justifyContent="center" alignItems="center">
              <Grid item>
                <Chip
                  icon={<LockIcon />}
                  label="100% Anonymous"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'common.white',
                    '& .MuiSvgIcon-root': { color: 'common.white' },
                  }}
                />
              </Grid>
              <Grid item>
                <Chip
                  icon={<SecurityIcon />}
                  label="End-to-End Encrypted"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'common.white',
                    '& .MuiSvgIcon-root': { color: 'common.white' },
                  }}
                />
              </Grid>
              <Grid item>
                <Chip
                  icon={<GroupIcon />}
                  label="Global Community"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'common.white',
                    '& .MuiSvgIcon-root': { color: 'common.white' },
                  }}
                />
              </Grid>
            </Grid>

            {/* CTA Buttons */}
            <Stack spacing={3} alignItems="center">
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'center', sm: 'flex-start' }}
                spacing={2}
                sx={{ width: '100%', maxWidth: 500 }}
              >
                <Button
                  variant="contained"
                  size="medium"
                  onClick={handleStartIndividualChat}
                  sx={{
                    py: 1.25,
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  Start Chatting Now
                </Button>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={handleExploreRooms}
                  sx={{
                    py: 1.25,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'common.white',
                    '&:hover': {
                      borderColor: 'common.white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Explore Chat Rooms
                </Button>
              </Stack>

              <Typography
                variant="body1"
                align="center"
                sx={{
                  color: 'common.white',
                  opacity: 0.8,
                }}
              >
                No sign-up required • Start chatting instantly • 100% free
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Arrow space placeholder */}
        <Box
          sx={{
            position: 'fixed', // Change to fixed positioning
            bottom: { xs: '20px', sm: '40px' }, // Position from bottom of viewport
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            height: 'auto', // Remove fixed height
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: showArrow ? 'auto' : 'none', // Disable interactions when hidden
            opacity: showArrow ? 1 : 0, // Fade in/out
            transition: 'opacity 0.3s ease', // Smooth transition
          }}
        >
          {/* Animated Arrow */}
          <Box
            sx={{
              animation: 'bounce 2s infinite',
              '@keyframes bounce': {
                '0%, 20%, 50%, 80%, 100%': {
                  transform: 'translateY(0)',
                },
                '40%': {
                  transform: 'translateY(-20px)',
                },
                '60%': {
                  transform: 'translateY(-10px)',
                },
              },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '50%',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconButton
                sx={{
                  color: 'common.white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  padding: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={handleArrowClick}
              >
                <KeyboardArrowDownIcon sx={{ fontSize: { xs: '1.5rem', sm: '2.5rem' } }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Jumbotron;
