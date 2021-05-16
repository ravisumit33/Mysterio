import React from 'react';
import Box from '@material-ui/core/Box';
import { Container, Grid, Paper, Typography } from '@material-ui/core';
import { ReactComponent as AnonymousIcon } from 'assets/images/anonymous.svg';
import FeatureCard from './card';

const Features = () => {
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
      title: 'Interest Groups',
      description: 'Interest groups for like minded people to chat anonymously.',
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
              <Typography variant="h5">Features</Typography>
            </Grid>
            <Grid item container xs justify="center" style={{ paddingTop: 40 }}>
              {featuresUI}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Paper>
  );
};

export default Features;
