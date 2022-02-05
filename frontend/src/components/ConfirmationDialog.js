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
  const { shouldShow, onClose, onCancel, onContinue, title, description } = props;
  return (
    <Dialog open={shouldShow} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={onContinue} color="primary">
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ConfirmationDialog.propTypes = {
  shouldShow: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onCancel: PropTypes.func,
  onContinue: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
};

ConfirmationDialog.defaultProps = {
  onClose: () => {},
  onCancel: () => {},
  description: '',
};

export default ConfirmationDialog;
