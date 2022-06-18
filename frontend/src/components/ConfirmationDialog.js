import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';

function ConfirmationDialog(props) {
  const {
    shouldShow,
    onClose,
    onCancel,
    onConfirm,
    title,
    description,
    cancelButtonText,
    confirmButtonText,
  } = props;
  return (
    <Dialog open={shouldShow} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          {cancelButtonText}
        </Button>
        <Button onClick={onConfirm} color="primary">
          {confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ConfirmationDialog.propTypes = {
  shouldShow: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  cancelButtonText: PropTypes.string,
  confirmButtonText: PropTypes.string,
};

ConfirmationDialog.defaultProps = {
  onClose: () => {},
  onCancel: () => {},
  description: '',
  cancelButtonText: 'Cancel',
  confirmButtonText: 'Confirm',
};

export default ConfirmationDialog;
