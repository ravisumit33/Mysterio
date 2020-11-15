import React from 'react';
import { AppBar, Container, Grid, Toolbar, Typography } from '@material-ui/core';
import { GitHub } from '@material-ui/icons';
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

const Icons = ['github'];

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focusedBtnKey: 'home',
    };
    this.setFocusedBtnKey = this.setFocusedBtnKey.bind(this);
    this.handleNavbarBtnClick = this.handleNavbarBtnClick.bind(this);
  }

  setFocusedBtnKey(key) {
    this.setState({
      focusedBtnKey: key,
    });
  }

  handleNavbarBtnClick(key) {
    if (DEBUG) console.log(PREFIX, 'handleNavbarBtnClick', key);
    if (Icons.indexOf(key) !== -1) return;
    this.setFocusedBtnKey(key);
  }

  render() {
    if (DEBUG) console.log(PREFIX, 'render');
    const { focusedBtnKey } = this.state;
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
    return (
      <AppBar position="sticky">
        <Toolbar>
          <Container>
            <Grid container alignItems="center">
              <Grid item>
                <Typography variant="h5">Mysterio</Typography>
              </Grid>
              <Grid item container justify="flex-end" xs alignItems="flex-end">
                {navbarBtns}
              </Grid>
            </Grid>
          </Container>
        </Toolbar>
      </AppBar>
    );
  }
}

export default NavBar;
