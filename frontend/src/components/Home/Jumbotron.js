import React from 'react';
import { useHistory } from 'react-router-dom';
import { alpha, Button, CardMedia, Grid, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import JumbotronBG from 'assets/images/jumbotron_bg.webp';
import { appStore } from 'stores';

const useStyles = makeStyles((theme) => ({
  jumbotron: {
    position: 'relative',
    minHeight: '55vh',
  },
  bg: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    backgroundColor: alpha(theme.palette.common.black, 0.1),
  },
  quickChatTxtSection: {
    background: `linear-gradient(to bottom, ${alpha(theme.palette.common.black, 1)}, ${alpha(
      theme.palette.common.black,
      0.75
    )}, ${alpha(theme.palette.common.black, 0.5)}, ${alpha(
      theme.palette.common.black,
      0.25
    )}, ${alpha(theme.palette.common.black, 0)})`,
  },
}));

function Jumbotron() {
  const classes = useStyles();
  const history = useHistory();

  const handleStartIndividualChat = () => {
    appStore.addChatWindow();
    history.push('/chat');
  };

  return (
    <Grid
      container
      id="jumbotron"
      className={classes.jumbotron}
      direction="column"
      justifyContent="flex-end"
    >
      <CardMedia className={classes.bg} image={JumbotronBG} title="Jumbotron Background" />
      <Grid item container className={classes.quickChatTxtSection} direction="column">
        <Grid item sx={{ my: 1 }}>
          <Typography variant="h3" align="center" sx={{ color: 'common.white' }}>
            Free Anonymous Chat
          </Typography>
        </Grid>
        <Grid item sx={{ my: 1, textAlign: 'center' }}>
          <Button
            color="secondary"
            variant="contained"
            size="large"
            onClick={handleStartIndividualChat}
          >
            Chat Now
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Jumbotron;
