import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import {
  AppBar,
  Box,
  Container,
  Grid,
  Hidden,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { Menu as MenuIcon, AccountCircle, ExitToApp } from '@material-ui/icons';
import { appStore, profileStore } from 'stores';
import Avatar from 'components/Avatar';
import RouterLink from 'components/RouterLink';
import { fetchUrl } from 'utils';
import NavbarButton from './NavBarButton';

const useStyles = makeStyles((theme) => ({
  title: {
    color: theme.palette.common.white,
  },
  smallAvatar: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  largeAvatar: {
    width: theme.spacing(6),
    height: theme.spacing(6),
  },
  drawerPlaceholder: {
    width: 240,
    flexShrink: 0,
  },
}));

function NavBar() {
  const history = useHistory();
  const location = useLocation();
  const atAccountPage = location.pathname === '/account';
  const classes = useStyles();
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

  const handleAccountBtnClick = () => {
    appStore.setShouldOpenAccountsDrawer(!appStore.shouldOpenAccountsDrawer);
  };

  const accountCircle = {
    type: 'icon',
    data: {
      key: 'account',
      text: 'Account',
      icon: profileStore.avatarUrl
        ? () => (
            <Avatar
              name={profileStore.email}
              avatarUrl={profileStore.avatarUrl}
              className={hamburgerTriggerElement ? classes.smallAvatar : classes.largeAvatar}
            />
          )
        : () => <AccountCircle fontSize="large" />,
      action: () => {
        setHamburgerTriggerElement(null);
        history.push('/account');
      },
    },
  };

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
        action: () => {
          setHamburgerTriggerElement(null);
          appStore.showWaitScreen('Logging you out');
          fetchUrl('/api/account/logout/', {
            method: 'post',
            body: {},
          })
            .then(() => {
              history.replace('/');
              profileStore.setEmail('');
            })
            .catch(() =>
              appStore.showAlert({
                text: 'Unable to log out. Make sure you are logged in.',
                severity: 'error',
              })
            )
            .finally(() => appStore.setShouldShowWaitScreen(false));
        },
      },
    },
  ];

  const commonNavbarButtons = [];

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
  if (!atAccountPage) {
    navbarBtns.push(accountCircle);
  }
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
      <NavbarButton {...navbarBtn.commonProps} />
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
            <NavbarButton {...navbarBtn.commonProps} isHamburgerMenu />
          </MenuItem>
        ))}
      </Menu>
    </>
  );

  return (
    <AppBar position="sticky">
      <Toolbar disableGutters>
        {atAccountPage && (
          <Hidden xsDown>
            <Box className={classes.drawerPlaceholder} />
          </Hidden>
        )}
        <Container>
          <Grid container alignItems="center" justifyContent="center">
            {atAccountPage && (
              <Hidden smUp>
                <Grid item xs>
                  <IconButton onClick={handleAccountBtnClick} color="inherit" aria-label="account">
                    <AccountCircle fontSize="large" />
                  </IconButton>
                </Grid>
              </Hidden>
            )}
            <Grid item>
              <RouterLink to="/">
                <Typography variant="h5" className={classes.title}>
                  Mysterio
                </Typography>
              </RouterLink>
            </Grid>
            <Grid item container justifyContent="flex-end" xs alignItems="center">
              <Hidden xsDown>{navbarMenu}</Hidden>
              <Hidden smUp>{hamburgerMenu}</Hidden>
            </Grid>
          </Grid>
        </Container>
      </Toolbar>
    </AppBar>
  );
}

export default observer(NavBar);
