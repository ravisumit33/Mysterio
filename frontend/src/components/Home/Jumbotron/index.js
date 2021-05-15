import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import {
  Button,
  CardMedia,
  Container,
  Grid,
  makeStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import JumbotronBG from 'assets/images/jumbotron_bg.jpg';
import { ReactComponent as QuickChatImg } from 'assets/images/quick_chat.svg';
import { chatContainerStore, profileStore } from 'stores';
import { observer } from 'mobx-react-lite';

const useStyle = makeStyles((theme) => ({
  jumbotron: {
    display: 'flex',
    position: 'relative',
    width: '100%',
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
    height: '90%',
  },
}));

const Jumbotron = () => {
  const classes = useStyle();
  const [userInfoDialogOpen, setUserInfoDialogOpen] = useState(false);
  const [textFieldValue, setTextFieldValue] = useState('');

  const handleStartIndividualChat = () => {
    chatContainerStore.addChatWindow();
  };

  const handleTextFieldChange = (e) => {
    setTextFieldValue(e.target.value);
  };

  const handleDialogueButtonClick = () => {
    closeUserInfoDialog();
    profileStore.setName(textFieldValue);
    handleStartIndividualChat();
  };

  const closeUserInfoDialog = () => {
    setUserInfoDialogOpen(false);
  };

  const openUserInfoDialog = () => {
    setUserInfoDialogOpen(true);
  };

  return (
    <Box id="jumbotron">
      <Box className={classes.jumbotron}>
        <CardMedia className={classes.bg} image={JumbotronBG} title="Jumbotron Background" />
        <Container>
          <Grid
            container
            spacing={1}
            direction="column"
            justify="space-between"
            className={classes.gridRoot}
          >
            <Grid item container justify="center">
              <Grid item xs={12} md={7}>
                <Box py={3}>
                  <QuickChatImg width="100%" height="300" />
                </Box>
              </Grid>
            </Grid>
            <Grid item container justify="center">
              <Grid item>
                <Button
                  color="secondary"
                  variant="contained"
                  size="large"
                  disabled={chatContainerStore.individualChatExist}
                  onClick={profileStore.name ? handleStartIndividualChat : openUserInfoDialog}
                >
                  Chat Now
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Dialog
        open={userInfoDialogOpen}
        onClose={closeUserInfoDialog}
        onKeyPress={(e) => e.key === 'Enter' && textFieldValue && handleDialogueButtonClick()}
      >
        <DialogTitle>Let&apos;s get started!</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={textFieldValue}
            onChange={handleTextFieldChange}
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={!textFieldValue} onClick={handleDialogueButtonClick} color="primary">
            Go
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default observer(Jumbotron);
