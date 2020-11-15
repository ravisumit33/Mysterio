import React from 'react';
import {
  AppBar,
  Container,
  Grid,
  Hidden,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { GitHub, Menu as MenuIcon } from '@material-ui/icons';
import ButtonWrapper from './ButtonWrapper';

const PREFIX = '[components/NavBar]';
const DEBUG = true;

const navbarButtons = [
  {
    type: 'text',
    data: {
      key: 'home',
      text: 'Home',
    },
  },
  {
    type: 'text',
    data: {
      key: 'features',
      text: 'Features',
    },
  },
  {
    type: 'text',
    data: {
      key: 'about',
      text: 'About',
    },
  },
  {
    type: 'text',
    data: {
      key: 'contributors',
      text: 'Contributors',
    },
  },
  {
    type: 'icon',
    data: {
      key: 'github',
      icon: GitHub,
      link: 'https://github.com/ravisumit33/Mysterio',
    },
  },
];

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focusedBtnKey: 'home',
      hamburgerTriggerElement: null,
    };
    this.setFocusedBtnKey = this.setFocusedBtnKey.bind(this);
    this.handleNavbarBtnClick = this.handleNavbarBtnClick.bind(this);
    this.handleHamburgerClick = this.handleHamburgerClick.bind(this);
    this.handleHamburgerClose = this.handleHamburgerClose.bind(this);
  }

  setFocusedBtnKey(key) {
    this.setState({
      focusedBtnKey: key,
    });
  }

  handleNavbarBtnClick(key) {
    if (DEBUG) console.log(PREFIX, 'handleNavbarBtnClick', key);
    this.setFocusedBtnKey(key);
  }

  handleHamburgerClick(event) {
    event.preventDefault();
    this.setState({
      hamburgerTriggerElement: event.currentTarget,
    });
  }

  handleHamburgerClose() {
    this.setState({
      hamburgerTriggerElement: null,
    });
  }

  render() {
    if (DEBUG) console.log(PREFIX, 'render');
    const { focusedBtnKey, hamburgerTriggerElement } = this.state;
    const navbarBtns = navbarButtons.map((navbarBtn) => (
      <Grid item key={navbarBtn.data.key}>
        <ButtonWrapper
          type={navbarBtn.type}
          data={navbarBtn.data}
          focused={focusedBtnKey === navbarBtn.data.key}
          onClickHandler={this.handleNavbarBtnClick}
        />
      </Grid>
    ));
    const hamburgerMenu = (
      <>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={this.handleHamburgerClick}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          id="navbar-menu"
          anchorEl={hamburgerTriggerElement}
          keepMounted
          open={Boolean(hamburgerTriggerElement)}
          onClose={this.handleHamburgerClose}
        >
          {navbarButtons.map((navbarBtn) => (
            <MenuItem
              key={navbarBtn.data.key}
              selected={focusedBtnKey === navbarBtn.data.key}
              dense
            >
              <ButtonWrapper
                type={navbarBtn.type}
                data={navbarBtn.data}
                focused={focusedBtnKey === navbarBtn.data.key}
                onClickHandler={this.handleNavbarBtnClick}
              />
            </MenuItem>
          ))}
        </Menu>
      </>
    );
    return (
      <AppBar position="sticky">
        <Toolbar>
          <Container disableGutters>
            <Grid container alignItems="center" style={{ height: '64px' }}>
              <Grid item>
                <Typography variant="h5">Mysterio</Typography>
              </Grid>
              <Grid item container justify="flex-end" xs alignItems="flex-end">
                <Hidden xsDown>{navbarBtns}</Hidden>
                <Hidden smUp>{hamburgerMenu}</Hidden>
              </Grid>
            </Grid>
          </Container>
        </Toolbar>
      </AppBar>
    );
  }
}

export default NavBar;
