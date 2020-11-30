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
      description: 'No one knows who you are.',
    },
    {
      icon: 'shuffle',
      title: 'Random',
      description: 'You can be matched with any person in this whole universe.',
    },
    {
      icon: 'lock',
      title: 'Secure',
      description: 'No one knows who you are.',
    },
    {
      icon: 'groups',
      title: 'Interest Groups',
      description: 'No one knows who you are.',
    },
    {
      icon: 'speed',
      title: 'Fast',
      description: 'No one knows who you are.',
    },
  ];

  const featuresUI = featuresData.map((feature) => (
    <FeatureCard
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
          <Grid container direction="column" spacing={5}>
            <Grid item>
              <Typography variant="h5">Features</Typography>
            </Grid>
            <Grid item container justify="center">
              {featuresUI}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Paper>
  );
};

export default Features;
