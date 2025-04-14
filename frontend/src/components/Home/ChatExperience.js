import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Grid,
  useTheme,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import SecurityIcon from '@mui/icons-material/Security';
import MovieIcon from '@mui/icons-material/Movie';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import BrushIcon from '@mui/icons-material/Brush';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import ForumIcon from '@mui/icons-material/Forum';
import SyncIcon from '@mui/icons-material/Sync';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ShareIcon from '@mui/icons-material/Share';

const FeatureCard = ({ icon, title, description, features, color, imageUrl }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
        border: '1px solid',
        borderColor: `${color}20`,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 24px ${color}15`,
          borderColor: `${color}40`,
          '& .illustration': {
            transform: 'scale(1.05)',
            opacity: 0.9,
          },
          '& .feature-box': {
            transform: 'translateX(4px)',
            bgcolor: `${color}15`,
          },
        },
      }}
    >
      <Box
        className="illustration"
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '40%',
          height: '100%',
          opacity: 0.7,
          transition: 'all 0.3s ease',
          display: { xs: 'none', md: 'block' },
          '& img': {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: 2,
          },
        }}
      >
        <Box component="img" src={imageUrl} alt={title} />
      </Box>

      <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            '& .MuiSvgIcon-root': {
              fontSize: 32,
            },
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${color}40`,
              '& .MuiSvgIcon-root': {
                color,
                fontSize: 32,
              },
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              lineHeight: 1,
              color,
              fontSize: '2rem',
            }}
          >
            {title}
          </Typography>
        </Box>

        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            fontSize: '1.1rem',
            maxWidth: '60%',
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>

        <Stack spacing={2}>
          {features.map((feature, index) => {
            const FeatureIcon = feature.icon;
            return (
              <Box
                key={index}
                className="feature-box"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: `${color}10`,
                  transition: 'all 0.3s ease',
                  '& .MuiSvgIcon-root': {
                    color,
                    fontSize: 24,
                  },
                }}
              >
                <FeatureIcon />
                <Typography
                  sx={{
                    color: 'text.primary',
                    fontWeight: 500,
                    fontSize: '1rem',
                  }}
                >
                  {feature.text}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
};

FeatureCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  features: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.elementType.isRequired,
      text: PropTypes.string.isRequired,
    })
  ).isRequired,
  color: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
};

function ChatExperience() {
  const theme = useTheme();

  return (
    <Box
      id="chat-experience"
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
              Choose Your Chat Experience
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'text.secondary',
                mb: 4,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
              }}
            >
              Connect with others in the way that suits you best. Whether you prefer one-on-one
              conversations, group discussions, or interactive activities, we've got you covered.
            </Typography>
          </Box>

          {/* Experiences Grid */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <FeatureCard
                icon={<ChatIcon />}
                title="One-on-One Chat"
                description="Start a private conversation with a random user. Perfect for meaningful one-on-one discussions where you can truly connect."
                features={[
                  { icon: LockIcon, text: 'End-to-end encrypted messages' },
                  { icon: VisibilityOffIcon, text: 'Complete anonymity guaranteed' },
                  { icon: ChatIcon, text: 'Real-time messaging' },
                ]}
                color="primary.main"
                imageUrl="https://img.icons8.com/bubbles/500/chat.png"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FeatureCard
                icon={<GroupIcon />}
                title="Group Chat Rooms"
                description="Join dynamic group chat rooms where you can engage with multiple users. Share ideas, discuss topics, and connect with like-minded individuals."
                features={[
                  { icon: SupervisedUserCircleIcon, text: 'Moderated discussions' },
                  { icon: ForumIcon, text: 'Topic-based chat rooms' },
                  { icon: SecurityIcon, text: 'Secure group environment' },
                ]}
                color="secondary.main"
                imageUrl="https://img.icons8.com/bubbles/500/group.png"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FeatureCard
                icon={<MovieIcon />}
                title="Watch Together"
                description="Synchronize video playback with friends and chat in real-time. Perfect for watching movies, shows, or sharing your favorite content together."
                features={[
                  { icon: SyncIcon, text: 'Synchronized playback' },
                  { icon: ThumbUpIcon, text: 'Live reactions and comments' },
                  { icon: ShareIcon, text: 'Easy content sharing' },
                ]}
                color="error.main"
                imageUrl="https://img.icons8.com/bubbles/500/video-playlist.png"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FeatureCard
                icon={<SportsEsportsIcon />}
                title="Play Together"
                description="Engage in multiplayer games with friends. From classic board games to interactive challenges, there's something for everyone."
                features={[
                  { icon: VideogameAssetIcon, text: 'Multiple game options' },
                  { icon: EmojiEventsIcon, text: 'Competitive tournaments' },
                  { icon: GroupIcon, text: 'Team-based gameplay' },
                ]}
                color="warning.main"
                imageUrl="https://img.icons8.com/bubbles/500/controller.png"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FeatureCard
                icon={<BrushIcon />}
                title="Draw Together"
                description="Collaborate on digital art with others in real-time. Share your creativity and create amazing artwork together."
                features={[
                  { icon: ColorLensIcon, text: 'Rich color palette' },
                  { icon: BrushIcon, text: 'Multiple drawing tools' },
                  { icon: ShareIcon, text: 'Easy artwork sharing' },
                ]}
                color="info.main"
                imageUrl="https://img.icons8.com/bubbles/500/paint-palette.png"
              />
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}

export default ChatExperience;
