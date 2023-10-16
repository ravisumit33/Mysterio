import React from 'react';
import Box from '@mui/material/Box';
import { Container, Grid, Paper, Typography } from '@mui/material';
import ContributorCard from './card';

function Contributors() {
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
    <Grid item key={contributor.title}>
      <ContributorCard
        icon={contributor.icon}
        title={contributor.title}
        description={contributor.description}
        href={contributor.href}
      />
    </Grid>
  ));

  return (
    <Paper square>
      <Box id="contributors">
        <Container>
          <Typography variant="h4" align="center" sx={{ py: 5 }}>
            Contributors
          </Typography>
          <Grid container justifyContent="center">
            {contributorsUI}
          </Grid>
        </Container>
      </Box>
    </Paper>
  );
}

export default Contributors;
