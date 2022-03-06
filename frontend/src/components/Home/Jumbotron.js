import React from 'react';
import { useHistory } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import { alpha, Button, CardMedia, Grid, makeStyles, Typography } from '@material-ui/core';
import JumbotronBG from 'assets/images/jumbotron_bg.webp';
import { ReactComponent as QuickChatImg } from 'assets/images/quick_chat.svg';
import { appStore } from 'stores';

const useStyles = makeStyles((theme) => ({
  jumbotron: {
    position: 'relative',
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
      padding: theme.spacing(2, 0),
    },
    color: theme.palette.common.white,
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
    <Box id="jumbotron" className={classes.jumbotron}>
      <CardMedia className={classes.bg} image={JumbotronBG} title="Jumbotron Background" />
      <Grid container>
        <Grid item>
          <Box py={3}>
            <QuickChatImg width="100%" className={classes.quickChatImg} />
          </Box>
        </Grid>
        <Grid item container className={classes.quickChatTxtSection} direction="column">
          <Grid item>
            <Box>
              <Typography variant="h3" className={classes.quickChatDesc} align="center">
                Free Anonymous Chat
              </Typography>
            </Box>
          </Grid>
          <Grid item container justifyContent="center">
            <Grid item>
              <Box py={2}>
                <Button
                  color="secondary"
                  variant="contained"
                  size="large"
                  onClick={handleStartIndividualChat}
                >
                  Chat Now
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Jumbotron;
