import React, { useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { MoreVert } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { appStore } from 'stores';
import ConfirmationDialog from 'components/ConfirmationDialog';
import { ChatWindowStoreContext } from 'contexts';
import { fetchUrl } from 'utils';

function MoreMenu(props) {
  const { isGroupChat, className } = props;
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState(null);
  const [shouldShowDeleteConfirmationDialog, setShouldShowDeleteConfirmationDialog] =
    useState(false);
  const history = useHistory();
  const chatWindowStore = useContext(ChatWindowStoreContext);
  const { roomInfo } = chatWindowStore;
  const { roomId } = roomInfo;

  const handleMoreMenuClick = (event) => {
    setMoreMenuAnchorEl(event.currentTarget);
  };
  const handleMoreMenuClose = () => {
    setMoreMenuAnchorEl(null);
  };

  const handleDeleteRoom = () => {
    appStore.showWaitScreen('Deleting Room');
    fetchUrl(`/api/chat/rooms/${roomId}/`, {
      method: 'delete',
      headers: { 'X-Room-Password': roomInfo.password },
    })
      .then(() => {
        appStore.removeChatWindow();
        history.push('/');
        appStore.showAlert({
          text: 'Room deleted successfully.',
          severity: 'success',
        });
      })
      .catch((error) => {
        if (error.status === 401 || error.status === 403) {
          appStore.showAlert({
            text: 'Only creator can delete the room.',
            action: 'login',
            severity: 'error',
          });
        } else {
          appStore.showAlert({
            text: 'Error occurred while deleting. Try again later.',
            severity: 'error',
          });
        }
      })
      .finally(() => {
        appStore.setShouldShowWaitScreen(false);
        setShouldShowDeleteConfirmationDialog(false);
      });
  };

  const individualChatMenuItems = [];
  const groupChatMenuItems = [
    {
      onClick: () => setShouldShowDeleteConfirmationDialog(true),
      text: useMemo(() => <Typography color="error.main">Delete</Typography>, []),
      icon: useMemo(() => <DeleteIcon color="error" />, []),
    },
  ];

  const menuItems = isGroupChat ? groupChatMenuItems : individualChatMenuItems;
  const renderMoreMenu = () =>
    menuItems.length ? (
      <>
        <IconButton className={className} size="large" onClick={handleMoreMenuClick}>
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={moreMenuAnchorEl}
          open={Boolean(moreMenuAnchorEl)}
          onClose={handleMoreMenuClose}
        >
          {menuItems.map((item) => (
            <MenuItem
              onClick={(evt) => {
                item.onClick(evt);
                handleMoreMenuClose();
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>{item.text}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </>
    ) : null;

  return (
    <>
      {renderMoreMenu()}
      <ConfirmationDialog
        shouldShow={shouldShowDeleteConfirmationDialog}
        onClose={() => setShouldShowDeleteConfirmationDialog(false)}
        onCancel={() => setShouldShowDeleteConfirmationDialog(false)}
        onConfirm={handleDeleteRoom}
        title="Delete this room?"
        description="This will permanently delete this room and all its messages."
      />
    </>
  );
}

MoreMenu.propTypes = {
  isGroupChat: PropTypes.bool.isRequired,
  className: PropTypes.string,
};

MoreMenu.defaultProps = {
  className: '',
};

export default MoreMenu;
