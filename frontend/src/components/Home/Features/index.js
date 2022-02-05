import React from 'react';
import Box from '@material-ui/core/Box';
import { Container, Grid, Paper, Typography } from '@material-ui/core';
import { ReactComponent as AnonymousIcon } from 'assets/images/anonymous.svg';
import FeatureCard from './card';

function Features() {
  const featuresData = [
    {
      icon: AnonymousIcon,
      isLocalIcon: true,
      title: 'Anonymous',
      description: 'No one knows who you are. Truly anonymous experience.',
    },
    {
      icon: 'shuffle',
      title: 'Random',
      description: 'You can be matched with any person in this whole universe. ',
    },
    {
      icon: 'lock',
      title: 'Secure',
      description: 'End to End encrypted chats for increased anonymity and security.',
    },
    {
      icon: 'groups',
      title: 'Interest Rooms',
      description:
        'Interest rooms for like minded people to chat anonymously. Create rooms and enjoy chatting for a month',
    },
    {
      icon: 'speed',
      title: 'Fast',
      description: 'Blazing fast matching with instant text messaging.',
    },
  ];

  const featuresUI = featuresData.map((feature) => (
    <FeatureCard
      key={feature.title}
      icon={feature.icon}
      title={feature.title}
      description={feature.description}
      isLocalIcon={feature.isLocalIcon}
    />
  ));

  return (
    <Paper square>
      <Box id="features">
        <Container>
          <Grid container direction="column" style={{ paddingTop: 40 }}>
            <Grid item style={{ textAlign: 'center' }}>
              <Typography variant="h4">Features</Typography>
            </Grid>
            <Grid item container xs justifyContent="center" style={{ paddingTop: 40 }}>
              {featuresUI}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Paper>
  );
}

export default Features;
