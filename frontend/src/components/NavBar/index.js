import React, { useState } from 'react';
import {
  AppBar,
  Container,
  createMuiTheme,
  Grid,
  Hidden,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  ThemeProvider,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { GitHub, Menu as MenuIcon } from '@material-ui/icons';
import CustomButton from './customButton';

const defaultTheme = createMuiTheme();
const customTheme = createMuiTheme({
  breakpoints: {
    values: {
      ...defaultTheme.breakpoints.values,
      md: 750,
    },
  },
});

const useStyles = makeStyles((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
}));

const navbarButtons = [
  {
    type: 'text',
    data: {
      key: 'home',
      text: 'Home',
      href: '#jumbotron',
    },
  },
  {
    type: 'text',
    data: {
      key: 'features',
      text: 'Features',
      href: '#features',
    },
  },
  {
    type: 'text',
    data: {
      key: 'contributors',
      text: 'Contributors',
      href: '#contributors',
    },
  },
  {
    type: 'icon',
    data: {
      key: 'github',
      text: 'Github',
      icon: GitHub,
      href: 'https://github.com/ravisumit33/Mysterio',
    },
  },
];

const NavBar = () => {
  const classes = useStyles();
  const [focusedBtnKey, setFocusedBtnKey] = useState('home');
  const [hamburgerTriggerElement, setHamburgerTriggerElement] = useState(null);

  const handleNavbarBtnClick = (key) => setFocusedBtnKey(key);
  const handleHamburgerClick = (event) => {
    event.preventDefault();
    setHamburgerTriggerElement(event.currentTarget);
  };
  const handleHamburgerClose = () => setHamburgerTriggerElement(null);

  const navbarBtns = navbarButtons.map((navbarBtn) => ({
    key: navbarBtn.data.key,
    commonProps: {
      type: navbarBtn.type,
      data: navbarBtn.data,
      focused: focusedBtnKey === navbarBtn.data.key,
      onClickHandler: handleNavbarBtnClick,
    },
  }));
  const navbarMenu = navbarBtns.map((navbarBtn) => (
    <Grid item key={navbarBtn.key}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <CustomButton {...navbarBtn.commonProps} />
    </Grid>
  ));
  const hamburgerMenu = (
    <>
      <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleHamburgerClick}>
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={hamburgerTriggerElement}
        keepMounted
        open={Boolean(hamburgerTriggerElement)}
        onClose={handleHamburgerClose}
      >
        {navbarBtns.map((navbarBtn) => (
          <MenuItem key={navbarBtn.key} selected={focusedBtnKey === navbarBtn.key} dense>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <CustomButton {...navbarBtn.commonProps} isHamburgerMenu />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
  return (
    <AppBar position="sticky" className={classes.appBar}>
      <Toolbar>
        <Container>
          <Grid container alignItems="center" style={{ height: '64px' }}>
            <Grid item>
              <Typography variant="h5">Mysterio</Typography>
            </Grid>
            <Grid item container justify="flex-end" xs alignItems="center">
              <ThemeProvider theme={customTheme}>
                <Hidden smDown>{navbarMenu}</Hidden>
                <Hidden mdUp>{hamburgerMenu}</Hidden>
              </ThemeProvider>
            </Grid>
          </Grid>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
