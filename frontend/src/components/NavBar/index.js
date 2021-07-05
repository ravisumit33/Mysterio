import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
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
import { Menu as MenuIcon, AccountCircle, ExitToApp } from '@material-ui/icons';
import { profileStore } from 'stores';
import Avatar from 'components/Avatar';
import RouterLink from 'components/RouterLink';
import { fetchUrl } from 'utils';
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
  title: {
    color: theme.palette.common.white,
  },
}));

const NavBar = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [focusedBtnKey, setFocusedBtnKey] = useState('home');
  const [hamburgerTriggerElement, setHamburgerTriggerElement] = useState(null);

  const handleNavbarBtnClick = (key) => {
    setFocusedBtnKey(key);
    setHamburgerTriggerElement(null);
  };
  const handleInternalHref = (id) => {
    setHamburgerTriggerElement(null);
    setTimeout(() => {
      window.location.href = id;
    }, 20);
  };
  const handleHamburgerClick = (event) => {
    event.preventDefault();
    setHamburgerTriggerElement(event.currentTarget);
  };
  const handleHamburgerClose = () => setHamburgerTriggerElement(null);

  const commonNavbarButtons = [
    {
      type: 'icon',
      data: {
        key: 'account',
        text: 'Account',
        icon: profileStore.isLoggedIn
          ? () => <Avatar name={profileStore.username} avatarUrl={profileStore.avatarUrl} />
          : () => <AccountCircle fontSize="large" />,
        action: () => history.push('/account'),
      },
    },
  ];

  const homeNavbarButtons = [
    {
      type: 'text',
      data: {
        key: 'home',
        text: 'Home',
        action: () => handleInternalHref('#jumbotron'),
      },
    },
    {
      type: 'text',
      data: {
        key: 'features',
        text: 'Features',
        action: () => handleInternalHref('#features'),
      },
    },
    {
      type: 'text',
      data: {
        key: 'contributors',
        text: 'Contributors',
        action: () => handleInternalHref('#contributors'),
      },
    },
  ];

  const accountNavbarButtons = [
    {
      type: 'icon',
      data: {
        key: 'logout',
        text: 'Logout',
        icon: ExitToApp,
        action: () =>
          fetchUrl('/api/logout').then(() => {
            profileStore.setUsername('');
            history.replace('/');
          }),
      },
    },
  ];

  let navbarBtns = [];
  switch (location.pathname) {
    case '/':
      navbarBtns.push(...homeNavbarButtons);
      break;
    case '/account':
      navbarBtns.push(...accountNavbarButtons);
      break;
    default:
      break;
  }
  navbarBtns.push(...commonNavbarButtons);
  navbarBtns = navbarBtns.map((navbarBtn) => ({
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
              <RouterLink to="/">
                <Typography variant="h5" className={classes.title}>
                  Mysterio
                </Typography>
              </RouterLink>
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

export default observer(NavBar);
