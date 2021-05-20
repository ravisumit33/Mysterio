import React from 'react';
import Box from '@material-ui/core/Box';
import { Button, CardMedia, Grid, makeStyles, Typography } from '@material-ui/core';
import JumbotronBG from 'assets/images/jumbotron_bg.jpg';
import { ReactComponent as QuickChatImg } from 'assets/images/quick_chat.svg';
import { chatContainerStore, profileStore, userInfoDialogStore } from 'stores';
import { observer } from 'mobx-react-lite';

const useStyle = makeStyles((theme) => ({
  jumbotron: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    width: '100%',
    height: '60vh',
    minHeight: '60vh',
  },
  bg: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    filter: 'blur(1.5px)',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  gridRoot: {
    flex: 1,
  },
  quickChatImg: {
    height: 300,
    [theme.breakpoints.down('sm')]: {
      height: 200,
    },
  },
  quickChatTxtSection: {
    background:
      'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0.75), rgba(0,0,0,0.5), rgba(0,0,0,0.25), rgba(0,0,0,0))',
  },
  quickChatDesc: {
    color: theme.palette.common.white,
  },
}));

const Jumbotron = () => {
  const classes = useStyle();

  const handleStartIndividualChat = () => {
    chatContainerStore.addChatWindow();
  };

  const handleStartChat = () => {
    profileStore.name ? handleStartIndividualChat() : userInfoDialogStore.setShouldOpen(true);
  };

  return (
    <Box id="jumbotron">
      <Box className={classes.jumbotron}>
        <CardMedia className={classes.bg} image={JumbotronBG} title="Jumbotron Background" />
        <Grid
          container
          spacing={1}
          direction="column"
          className={classes.gridRoot}
          justify="space-around"
        >
          <Grid item container justify="center">
            <Grid item xs={12} md={7}>
              <Box py={3}>
                <QuickChatImg width="100%" className={classes.quickChatImg} />
              </Box>
            </Grid>
          </Grid>
          <Grid item container className={classes.quickChatTxtSection} direction="column">
            <Grid item container justify="center">
              <Grid item xs={12}>
                <Box py={2}>
                  <Typography variant="h4" className={classes.quickChatDesc} align="center">
                    Free Anonymous Chat
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Grid item container justify="center">
              <Grid item>
                <Box py={2}>
                  <Button
                    color="secondary"
                    variant="contained"
                    size="large"
                    onClick={handleStartChat}
                  >
                    Chat Now
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default observer(Jumbotron);
