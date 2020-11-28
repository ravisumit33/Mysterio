import React, { useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  createMuiTheme,
  Divider,
  fade,
  Grid,
  Icon,
  InputBase,
  makeStyles,
  ThemeProvider,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import PeopleIcon from '@material-ui/icons/People';
import SearchIcon from '@material-ui/icons/Search';
import JumbotronBG from 'assets/images/jumbotron_bg.jpg';
import { red } from '@material-ui/core/colors';
import { chatContainerStore, profileStore } from 'stores';

const customTheme = createMuiTheme({
  palette: {
    divider: red[800],
  },
});

const useStyle = makeStyles((theme) => ({
  jumbotron: {
    display: 'flex',
    position: 'relative',
    width: '100%',
    minHeight: '80vh',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      minHeight: '100vh',
      padding: theme.spacing(3, 0),
    },
  },
  bg: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    filter: 'blur(2.5px)',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  card: {
    width: '100%',
    height: theme.spacing(40),
    color: theme.palette.primary.contrastText,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  chatCardWrapper: {
    position: 'relative',
    flexGrow: 1,
    flexBasis: 0,
  },
  chatCardDivider: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    height: '80%',
    transform: 'translate(-50%, -50%)',
  },
  appCardTitle: {
    height: theme.spacing(16),
  },
  appCardSubtitle: {
    padding: theme.spacing(10, 0),
  },
  appCardDescription: {
    padding: theme.spacing(10, 0),
  },
  chatIcon: {
    width: theme.spacing(16),
    height: theme.spacing(16),
    fontSize: theme.spacing(16),
  },
  individualChatButton: {
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
  },
  search: {
    position: 'relative',
    width: '80%',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    margin: 'auto',
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
}));

const Jumbotron = () => {
  const classes = useStyle();
  const [selectedRoomId, setSelectedRoomId] = useState(undefined);
  const [userInfoDialogOpen, setUserInfoDialogOpen] = useState(false);
  const [textFieldValue, setTextFieldValue] = useState('');
  const [trandingGroups, setTrandingGroups] = useState([]);

  useEffect(() => {
    const tempTrandingGroups = [
      {
        title: 'Title1',
        roomId: 1,
      },
      {
        title: 'Title2',
        roomId: 2,
      },
      {
        title: 'Title3',
        roomId: 3,
      },
      {
        title: 'Title4',
        roomId: 4,
      },
    ];
    setTrandingGroups(tempTrandingGroups);
  }, []);

  const handleStartIndividualChat = () => {
    chatContainerStore.addChatWindow();
  };

  const handleStartGroupChat = (roomId) => {
    chatContainerStore.addChatWindow(roomId);
  };

  const handleTextFieldChange = (e) => {
    setTextFieldValue(e.target.value);
  };

  const handleDialogueButtonClick = () => {
    closeUserInfoDialog();
    profileStore.setName(textFieldValue);
    selectedRoomId ? handleStartGroupChat(selectedRoomId) : handleStartIndividualChat();
  };

  const closeUserInfoDialog = () => {
    setUserInfoDialogOpen(false);
  };

  const openUserInfoDialog = () => {
    setUserInfoDialogOpen(true);
  };

  const trandingGroupsUI = trandingGroups.map((group, index) => (
    <Grid item key={group.roomId}>
      <Button
        variant="text"
        color="inherit"
        size="small"
        startIcon={<Icon>groups</Icon>}
        onClick={() => handleStartGroupChat(group.roomId)}
      >
        {group.title}
      </Button>
    </Grid>
  ));
  return (
    <ThemeProvider theme={customTheme}>
      <Box>
        <Box className={classes.jumbotron}>
          <CardMedia className={classes.bg} image={JumbotronBG} title="Jumbotron Background" />
          <Container>
            <Grid container spacing={1} justify="space-between">
              <Grid item container xs={12} md={6}>
                <Card className={classes.card}>
                  <CardContent>
                    <Grid
                      container
                      direction="column"
                      justify="center"
                      spacing={2}
                      alignContent="space-around"
                    >
                      <Grid
                        item
                        container
                        alignContent="flex-end"
                        justify="center"
                        className={classes.appCardTitle}
                      >
                        <Typography variant="h3">Mysterio</Typography>
                      </Grid>
                      <Grid item className={classes.appCardSubtitle}>
                        <Typography variant="subtitle1">
                          Chat Anounimously Chat Anounimously
                        </Typography>
                      </Grid>
                      <Grid item className={classes.appCardDescription}>
                        <Typography variant="caption" component="p">
                          No one knows who you are :P No one knows who you are :P No one knows who
                          you are :P No one knows who you are :PNo one knows who you are :P
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item container xs={12} md={6}>
                <Grid item className={classes.chatCardWrapper}>
                  <Divider className={classes.chatCardDivider} orientation="vertical" />
                  <Card className={classes.card}>
                    <CardContent>
                      <Grid container justify="space-between">
                        <Grid item style={{ flexBasis: 0, flexGrow: 1 }}>
                          <PeopleIcon className={classes.chatIcon} />
                        </Grid>
                        <Grid item style={{ flexBasis: 0, flexGrow: 1 }}>
                          <Icon className={classes.chatIcon}>groups</Icon>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardActions>
                      <Grid container>
                        <Grid item style={{ flexBasis: 0, flexGrow: 1 }}>
                          <Button
                            className={classes.individualChatButton}
                            color="inherit"
                            onClick={handleStartIndividualChat}
                          >
                            Chat Now
                          </Button>
                        </Grid>
                        <Grid
                          item
                          container
                          direction="column"
                          spacing={2}
                          style={{ flexBasis: 0, flexGrow: 1 }}
                        >
                          <Grid item>
                            <div className={classes.search}>
                              <div className={classes.searchIcon}>
                                <SearchIcon />
                              </div>
                              <InputBase
                                placeholder="Search…"
                                classes={{
                                  root: classes.inputRoot,
                                  input: classes.inputInput,
                                }}
                                inputProps={{ 'aria-label': 'search' }}
                              />
                            </div>
                          </Grid>
                          <Grid item container justify="space-evenly" spacing={2}>
                            {trandingGroupsUI}
                          </Grid>
                        </Grid>
                      </Grid>
                    </CardActions>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </Box>
        <Dialog open={userInfoDialogOpen} onClose={closeUserInfoDialog}>
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
    </ThemeProvider>
  );
};

export default Jumbotron;
