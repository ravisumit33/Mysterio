import React from 'react';
import Box from '@material-ui/core/Box';
import { Container, Grid, Paper, Typography } from '@material-ui/core';
import ContributorCard from './card';

const Contributors = () => {
  const contributorsData = [
    {
      icon: 'https://avatars3.githubusercontent.com/u/19284116?s=400&u=9e05e3d1ec7622cb55bc0af0ec58f81ce639e48e&v=4',
      href: 'https://github.com/ravisumit33',
      title: 'Sumit Kumar',
      description: '',
    },
    {
      icon: '',
      href: 'https://github.com/nileshvaishnav',
      title: 'Nilesh Vaishnav',
      description: '',
    },
  ];

  const contributorsUI = contributorsData.map((contributor) => (
    <ContributorCard
      key={contributor.title}
      icon={contributor.icon}
      title={contributor.title}
      description={contributor.description}
      href={contributor.href}
    />
  ));

  return (
    <Paper square>
      <Box id="contributors">
        <Container>
          <Grid container direction="column" spacing={0}>
            <Grid item style={{ paddingTop: 40, textAlign: 'center' }}>
              <Typography variant="h4">Contributors</Typography>
            </Grid>
            <Grid item container justifyContent="center" style={{ paddingTop: 40 }}>
              {contributorsUI}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Paper>
  );
};

export default Contributors;
