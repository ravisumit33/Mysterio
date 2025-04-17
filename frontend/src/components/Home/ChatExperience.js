import React from 'react';
import PropTypes from 'prop-types';
import { Box, Container, Typography, Paper, Stack, Grid, useTheme } from '@mui/material';
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

function FeatureCard({ icon, title, description, features, color, imageUrl }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        border: '2px solid',
        borderColor: `${color}40`,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 24px ${color}15`,
          borderColor: `${color}60`,
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
          width: { md: '40%' },
          height: '100%',
          opacity: 0.7,
          transition: 'all 0.3s ease',
          display: { xs: 'none', md: 'block' },
          '& img': {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: { xs: 1, sm: 1.5, md: 2 },
          },
        }}
      >
        <Box component="img" src={imageUrl} alt={title} />
      </Box>

      <Stack
        spacing={{ xs: 2, sm: 3 }}
        sx={{ position: 'relative', zIndex: 1, maxWidth: { xs: '100%', md: '60%' } }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 2 },
            '& .MuiSvgIcon-root': {
              fontSize: { xs: 28, sm: 32 },
            },
          }}
        >
          <Box
            sx={{
              p: { xs: 1, sm: 1.5 },
              borderRadius: 2,
              background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${color}40`,
              '& .MuiSvgIcon-root': {
                color: 'white',
                fontSize: { xs: 28, sm: 32 },
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
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            }}
          >
            {title}
          </Typography>
        </Box>

        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            fontSize: { xs: '1rem', sm: '1.1rem' },
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>

        <Stack spacing={2} sx={{ maxWidth: '100%' }}>
          {features.map((feature, index) => {
            const FeatureIcon = feature.icon;
            return (
              <Box
                key={feature.text}
                className="feature-box"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 1, sm: 1.5 },
                  p: { xs: 1, sm: 1.5 },
                  borderRadius: 1,
                  bgcolor: `${color}10`,
                  transition: 'all 0.3s ease',
                  '& .MuiSvgIcon-root': {
                    color,
                    fontSize: { xs: 20, sm: 24 },
                  },
                }}
              >
                <FeatureIcon />
                <Typography
                  sx={{
                    color: 'text.primary',
                    fontWeight: 500,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
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
}

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
        bgcolor: 'background.paper',
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
              conversations, group discussions, or interactive activities, we&apos;ve got you
              covered.
            </Typography>
          </Box>

          {/* Experiences Grid */}
          <Grid container justifyContent="center" rowSpacing={4} columnSpacing={{ xs: 0, lg: 4 }}>
            <Grid item xs={12} lg={5.5}>
              <FeatureCard
                icon={<ChatIcon />}
                title="One-on-One Chat"
                description="Start a private conversation with a random user. Perfect for meaningful one-on-one discussions where you can truly connect."
                features={[
                  { icon: LockIcon, text: 'End-to-end encrypted messages' },
                  { icon: VisibilityOffIcon, text: 'Complete anonymity guaranteed' },
                  { icon: ChatIcon, text: 'Real-time messaging' },
                ]}
                color={theme.palette.primary.main}
                imageUrl="https://img.icons8.com/bubbles/500/chat.png"
              />
            </Grid>

            <Grid item xs={12} lg={5.5}>
              <FeatureCard
                icon={<GroupIcon />}
                title="Group Chat Rooms"
                description="Join dynamic group chat rooms where you can engage with multiple users. Share ideas, discuss topics, and connect with like-minded individuals."
                features={[
                  { icon: SupervisedUserCircleIcon, text: 'Moderated discussions' },
                  { icon: ForumIcon, text: 'Topic-based chat rooms' },
                  { icon: SecurityIcon, text: 'Secure group environment' },
                ]}
                color={theme.palette.secondary.main}
                imageUrl="https://img.icons8.com/bubbles/500/group.png"
              />
            </Grid>

            <Grid item xs={12} lg={5.5}>
              <FeatureCard
                icon={<MovieIcon />}
                title="Watch Together"
                description="Synchronize video playback with friends and chat in real-time. Perfect for watching movies, shows, or sharing your favorite content together."
                features={[
                  { icon: SyncIcon, text: 'Synchronized playback' },
                  { icon: ThumbUpIcon, text: 'Live reactions and comments' },
                  { icon: ShareIcon, text: 'Easy content sharing' },
                ]}
                color={theme.palette.error.main}
                imageUrl="https://img.icons8.com/bubbles/500/video-playlist.png"
              />
            </Grid>

            <Grid item xs={12} lg={5.5}>
              <FeatureCard
                icon={<SportsEsportsIcon />}
                title="Play Together"
                description="Engage in multiplayer games with friends. From classic board games to interactive challenges, there's something for everyone."
                features={[
                  { icon: VideogameAssetIcon, text: 'Multiple game options' },
                  { icon: EmojiEventsIcon, text: 'Competitive tournaments' },
                  { icon: GroupIcon, text: 'Team-based gameplay' },
                ]}
                color={theme.palette.warning.main}
                imageUrl="https://img.icons8.com/bubbles/500/controller.png"
              />
            </Grid>

            <Grid item xs={12} lg={5.5}>
              <FeatureCard
                icon={<BrushIcon />}
                title="Draw Together"
                description="Collaborate on digital art with others in real-time. Share your creativity and create amazing artwork together."
                features={[
                  { icon: ColorLensIcon, text: 'Rich color palette' },
                  { icon: BrushIcon, text: 'Multiple drawing tools' },
                  { icon: ShareIcon, text: 'Easy artwork sharing' },
                ]}
                color={theme.palette.success.main}
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
