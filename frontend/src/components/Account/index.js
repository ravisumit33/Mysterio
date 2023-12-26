import React, { useState } from 'react';
import { Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import { makeStyles } from '@mui/styles';
import { appStore, profileStore } from 'stores';
import {
  Box,
  Button,
  IconButton,
  ListItemAvatar,
  ListItemButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { AccountCircle, Logout, Favorite, Edit, Login } from '@mui/icons-material';
import Avatar from 'components/Avatar';
import { fetchUrl } from 'utils';
import CenterPaper from 'components/CenterPaper';
import RouterLink from 'components/RouterLink';
import Profile from './Profile';
import ChangePassword from './ChangePassword';
import ConfirmationEmailSent from './ConfirmationEmailSent';
import ConfirmEmail from './ConfirmEmail';

const drawerWidth = 240;

const useStyles = makeStyles(() => ({
  drawerPaper: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
}));

function Account() {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
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
        <ListItem
          disableGutters
          secondaryAction={
            <Tooltip title="Edit profile" arrow>
              <IconButton
                edge="end"
                aria-label="edit profile"
                onClick={() => appStore.setShouldOpenUserInfoDialog(true)}
              >
                <Edit />
              </IconButton>
            </Tooltip>
          }
        >
          <ListItemAvatar>
            <Avatar name={profileStore.name} avatarUrl={profileStore.avatarUrl} />
          </ListItemAvatar>
          <ListItemText primary={profileStore.name} primaryTypographyProps={{ noWrap: true }} />
        </ListItem>
      </Toolbar>
      <Divider />
      <Stack justifyContent="space-between" sx={{ flex: 1 }}>
        <List>
          {drawerTabs.map((tab) => (
            <ListItemButton
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
            </ListItemButton>
          ))}
        </List>
        {profileStore.isLoggedIn ? (
          <List>
            <ListItemButton
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
                <Logout color="secondary" />
              </ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ color: 'secondary' }} />
            </ListItemButton>
          </List>
        ) : (
          <List>
            <ListItemButton
              onClick={() => history.push({ pathname: '/login', state: { from: location } })}
            >
              <ListItemIcon>
                <Login color="secondary" />
              </ListItemIcon>
              <ListItemText primary="Login" primaryTypographyProps={{ color: 'secondary' }} />
            </ListItemButton>
          </List>
        )}
      </Stack>
    </>
  );

  const renderTab = () => {
    if (!profileStore.isLoggedIn) {
      return (
        <CenterPaper>
          <Stack justifyContent="space-between" alignItems="center" spacing={1}>
            <Typography variant="h4" align="center">
              You are not logged in.
            </Typography>
            <Typography variant="body1" align="center">
              {`${selectedTab} is only available for logged in users.`}
            </Typography>
            <RouterLink to={{ pathname: '/login', state: { from: location } }} tabIndex={-1}>
              <Button variant="contained" color="secondary">
                Login
              </Button>
            </RouterLink>
          </Stack>
        </CenterPaper>
      );
    }
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
      <Route exact path={path}>
        <Stack direction="row">
          <Box
            component="nav"
            sx={{ width: { sm: drawerWidth, flexShrink: { sm: 0 } } }}
            aria-label="account details"
          >
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
              sx={{
                display: { xs: 'block', sm: 'none' },
              }}
            >
              {drawer}
            </Drawer>
            <Drawer
              classes={{
                paper: classes.drawerPaper,
              }}
              variant="permanent"
              open
              sx={{
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {drawer}
            </Drawer>
          </Box>
          <Box component="main" sx={{ flex: 1 }}>
            {renderTab()}
          </Box>
        </Stack>
      </Route>
      {!profileStore.social && (
        <Route path={`${path}/change-password`}>
          <ChangePassword />
        </Route>
      )}
    </Switch>
  );
}

export default observer(Account);
