import React, { useMemo, useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Menu,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  useScrollTrigger,
  Button,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Menu as MenuIcon, AccountCircle, Logout, Login, ArrowForward } from '@mui/icons-material';
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
    width: theme.spacing(5),
    height: theme.spacing(5),
  },
  drawerPlaceholder: {
    width: 240,
    flexShrink: 0,
  },
}));

function NavBar() {
  const history = useHistory();
  const location = useLocation();
  const theme = useTheme();
  const shouldShowHamburger = !useMediaQuery(theme.breakpoints.up('md'));
  const atAccountPage = location.pathname === '/account';
  const atHomePage = location.pathname === '/';
  const classes = useStyles();
  const [focusedBtnKey, setFocusedBtnKey] = useState('home');
  const [hamburgerTriggerElement, setHamburgerTriggerElement] = useState(null);

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  useEffect(() => {
    const sections = [
      { id: 'jumbotron', key: 'home' },
      { id: 'how-it-works', key: 'how-it-works' },
      { id: 'chat-experience', key: 'chat-experience' },
      { id: 'app-download', key: 'app-download' },
      { id: 'faq', key: 'faq' },
      { id: 'cta', key: 'cta' },
      { id: 'footer', key: 'footer' },
    ];

    const onChange = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const section = sections.find((s) => s.id === entry.target.id);
          if (section) {
            setFocusedBtnKey(section.key);
          }
        }
      });
    };

    const intersectionObserver = new IntersectionObserver(onChange, {
      root: null,
      threshold: 0,
      rootMargin: '-50% 0px -50% 0px',
    });

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        intersectionObserver.observe(element);
      }
    });

    return () => {
      sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) {
          intersectionObserver.unobserve(element);
        }
      });
    };
  }, []);

  const handleNavbarBtnClick = (key) => {
    setFocusedBtnKey(key);
    setHamburgerTriggerElement(null);
  };

  const handleInternalHref = (id) => {
    setHamburgerTriggerElement(null);
    const sectionId = id.replace('#', '');
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setFocusedBtnKey(sectionId);
    }
  };

  const handleHamburgerClick = (event) => {
    event.preventDefault();
    setHamburgerTriggerElement(event.currentTarget);
  };
  const handleHamburgerClose = () => setHamburgerTriggerElement(null);

  const handleAccountBtnClick = () => {
    appStore.setShouldOpenAccountsDrawer(!appStore.shouldOpenAccountsDrawer);
  };

  const { name, avatarUrl } = profileStore;
  const avatarIcon = useMemo(
    () => (
      <Avatar
        name={name}
        avatarUrl={avatarUrl}
        className={shouldShowHamburger ? classes.smallAvatar : classes.largeAvatar}
      />
    ),
    [avatarUrl, classes.largeAvatar, classes.smallAvatar, name, shouldShowHamburger]
  );

  const accountCircleIcon = useMemo(
    () => (
      <AccountCircle
        fontSize="large"
        className={shouldShowHamburger ? classes.smallAvatar : classes.largeAvatar}
      />
    ),
    [classes.largeAvatar, classes.smallAvatar, shouldShowHamburger]
  );

  const accountCircle = {
    type: 'icon',
    data: {
      key: 'account',
      text: 'Account',
      icon: profileStore.avatarUrl ? avatarIcon : accountCircleIcon,
      action: () => {
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
        key: 'how-it-works',
        text: 'How It Works',
        action: () => handleInternalHref('#how-it-works'),
      },
    },
    {
      type: 'text',
      data: {
        key: 'chat-experience',
        text: 'Chat Experience',
        action: () => handleInternalHref('#chat-experience'),
      },
    },
    {
      type: 'text',
      data: {
        key: 'app-download',
        text: 'Download App',
        action: () => handleInternalHref('#app-download'),
      },
    },
    {
      type: 'text',
      data: {
        key: 'faq',
        text: 'FAQ',
        action: () => handleInternalHref('#faq'),
      },
    },
  ];

  const logoutIcon = useMemo(() => <Logout />, []);
  const loginIcon = useMemo(() => <Login />, []);
  const accountNavbarButtons = [];
  if (profileStore.isLoggedIn) {
    accountNavbarButtons.push({
      type: 'icon',
      data: {
        key: 'logout',
        text: 'Logout',
        icon: logoutIcon,
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
    });
  } else {
    accountNavbarButtons.push({
      type: 'icon',
      data: {
        key: 'login',
        text: 'Login',
        icon: loginIcon,
        action: () => {
          setHamburgerTriggerElement(null);
          history.push({ pathname: '/login', state: { from: location } });
        },
      },
    });
  }

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
    // eslint-disable-next-line react/jsx-props-no-spreading
    <NavbarButton key={navbarBtn.key} {...navbarBtn.commonProps} />
  ));
  const hamburgerMenu = (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <IconButton color="inherit" aria-label="menu" onClick={handleHamburgerClick} size="large">
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={hamburgerTriggerElement}
        keepMounted
        open={Boolean(hamburgerTriggerElement)}
        onClose={handleHamburgerClose}
      >
        {navbarBtns.map((navbarBtn) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <NavbarButton key={navbarBtn.key} {...navbarBtn.commonProps} isHamburgerMenu />
        ))}
      </Menu>
    </Box>
  );

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: trigger ? theme.palette.primary.main : 'transparent',
        boxShadow: trigger ? 1 : 'none',
        backdropFilter: !trigger ? 'blur(10px)' : 'none',
        transition: theme.transitions.create(['background-color', 'box-shadow', 'backdrop-filter']),
      }}
    >
      <Toolbar disableGutters>
        {atAccountPage && (
          <Box
            sx={{ display: { xs: 'none', md: 'block' } }}
            className={classes.drawerPlaceholder}
          />
        )}
        <Container>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            {atAccountPage && (
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <IconButton
                  onClick={handleAccountBtnClick}
                  color="inherit"
                  aria-label="account"
                  size="large"
                >
                  <AccountCircle fontSize="large" />
                </IconButton>
              </Box>
            )}
            <RouterLink to="/">
              <Typography variant="h5" className={classes.title}>
                Mysterio
              </Typography>
            </RouterLink>
            <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={2}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="flex-end"
                spacing={2}
                sx={{ display: { xs: 'none', md: 'block' } }}
              >
                {navbarMenu}
              </Stack>
              {atHomePage && (
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  endIcon={<ArrowForward />}
                  onClick={() => history.push('/chat/match')}
                >
                  Chat Now
                </Button>
              )}
              {hamburgerMenu}
            </Stack>
          </Stack>
        </Container>
      </Toolbar>
    </AppBar>
  );
}

export default observer(NavBar);
