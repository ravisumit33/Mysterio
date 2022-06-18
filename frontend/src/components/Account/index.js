import React, { useState } from 'react';
import { Redirect, Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import { appStore, profileStore } from 'stores';
import { Grid, ListItemAvatar } from '@material-ui/core';
import { AccountCircle, ExitToApp, Favorite } from '@material-ui/icons';
import Avatar from 'components/Avatar';
import { fetchUrl } from 'utils';
import Profile from './Profile';
import ChangePassword from './ChangePassword';
import ConfirmationEmailSent from './ConfirmationEmailSent';
import ConfirmEmail from './ConfirmEmail';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
    },
  },
  drawerPaper: {
    width: drawerWidth,
  },
}));

function Account(props) {
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const { path } = useRouteMatch();
  const [selectedTab, setSelectedTab] = useState('Profile');

  const drawerTabs = [
    {
      text: 'Profile',
      icon: AccountCircle,
    },
    {
      text: 'Favorite rooms',
      icon: Favorite,
    },
  ];

  const drawer = (
    <>
      <Toolbar>
        <ListItem disableGutters>
          <ListItemAvatar>
            <Avatar name={profileStore.email} avatarUrl={profileStore.avatarUrl} />
          </ListItemAvatar>
          <ListItemText primary={profileStore.username} />
        </ListItem>
      </Toolbar>
      <Divider />
      <Grid item xs container direction="column" justifyContent="space-between">
        <Grid item>
          <List>
            {drawerTabs.map((tab) => (
              <ListItem
                button
                selected={selectedTab === tab.text}
                onClick={() => {
                  setSelectedTab(tab.text);
                  appStore.setShouldOpenAccountsDrawer(false);
                }}
                key={tab.text}
              >
                <ListItemIcon>
                  <tab.icon />
                </ListItemIcon>
                <ListItemText primary={tab.text} />
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item>
          <List>
            <ListItem
              button
              onClick={() => {
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
              }}
            >
              <ListItemIcon>
                <ExitToApp color="secondary" />
              </ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ color: 'secondary' }} />
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </>
  );

  const renderTab = () => {
    switch (selectedTab) {
      case 'Profile':
        return <Profile />;
      default:
        return '';
    }
  };

  return (
    <Switch>
      <Route path={`${path}/confirmation-email-sent`}>
        <ConfirmationEmailSent />
      </Route>
      <Route path={`${path}/confirm-email/:key`}>
        <ConfirmEmail />
      </Route>
      {!profileStore.isLoggedIn ? (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: location },
          }}
        />
      ) : (
        <>
          <Route exact path={path}>
            <Grid item container>
              <Grid item>
                <nav className={classes.drawer} aria-label="account details">
                  <Hidden smUp>
                    <Drawer
                      variant="temporary"
                      anchor="left"
                      open={appStore.shouldOpenAccountsDrawer}
                      onClose={() => appStore.setShouldOpenAccountsDrawer(false)}
                      classes={{
                        paper: classes.drawerPaper,
                      }}
                      ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                      }}
                    >
                      {drawer}
                    </Drawer>
                  </Hidden>
                  <Hidden xsDown>
                    <Drawer
                      classes={{
                        paper: classes.drawerPaper,
                      }}
                      variant="permanent"
                      open
                    >
                      {drawer}
                    </Drawer>
                  </Hidden>
                </nav>
              </Grid>
              <Grid item xs>
                <main>{renderTab()}</main>
              </Grid>
            </Grid>
          </Route>
          {!profileStore.social && (
            <Route path={`${path}/change-password`}>
              <ChangePassword />
            </Route>
          )}
        </>
      )}
    </Switch>
  );
}

export default observer(Account);
