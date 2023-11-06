import React from 'react';
import { useHistory } from 'react-router-dom';
import { alpha, Button, CardMedia, Stack, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import JumbotronBG from 'assets/images/jumbotron_bg.webp';

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
    history.push('/chat/dual');
  };

  return (
    <Stack id="jumbotron" className={classes.jumbotron} justifyContent="flex-end">
      <CardMedia className={classes.bg} image={JumbotronBG} title="Jumbotron Background" />
      <Stack className={classes.quickChatTxtSection} spacing={1} alignItems="center" sx={{ py: 1 }}>
        <Typography variant="h3" align="center" sx={{ color: 'common.white' }}>
          Free Anonymous Chat
        </Typography>
        <Button color="secondary" variant="contained" onClick={handleStartIndividualChat}>
          Chat Now
        </Button>
      </Stack>
    </Stack>
  );
}

export default Jumbotron;
