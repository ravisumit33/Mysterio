import React from 'react';
import { useHistory } from 'react-router-dom';
import { alpha, Button, CardMedia, Grid, makeStyles, Typography } from '@material-ui/core';
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
  quickChatImg: {
    height: 300,
    [theme.breakpoints.down('sm')]: {
      height: 200,
    },
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
  quickChatDesc: {
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1, 0),
    },
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(2, 0, 1, 0),
    },
    color: theme.palette.common.white,
  },
  chatNowButton: {
    padding: theme.spacing(2, 0, 2, 0),
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
        <Grid item>
          <Typography variant="h3" className={classes.quickChatDesc} align="center">
            Free Anonymous Chat
          </Typography>
        </Grid>
        <Grid item container justifyContent="center">
          <Grid item className={classes.chatNowButton}>
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
    </Grid>
  );
}

export default Jumbotron;
