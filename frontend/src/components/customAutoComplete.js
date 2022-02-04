import React from 'react';
import PropTypes from 'prop-types';
import { Autocomplete } from '@material-ui/lab';
import {
  Avatar,
  Grid,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  TextField,
  Tooltip,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { TextAvatar } from './Avatar';

const useStyles = makeStyles((theme) => ({
  inputLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    right: theme.spacing(5), // do not overlap icon
    bottom: 0,
  },
  inputLabelShrinked: {
    right: 'unset', // show complete label if shrinked
  },
}));

const CustomAutoComplete = (props) => {
  const {
    nameField,
    inputLabel,
    value,
    setPendingValue,
    setValue,
    getSecondaryText,
    autoCompleteProps,
  } = props;
  const classes = useStyles();
  let startInputAvatar;
  if (value) {
    startInputAvatar = value.avatar ? <value.avatar /> : <TextAvatar name={value[nameField]} />;
  } else {
    startInputAvatar = (
      <Avatar>
        <SearchIcon />
      </Avatar>
    );
  }
  return (
    <Autocomplete
      size="small"
      onInputChange={(event, newPendingValue) => setPendingValue(newPendingValue)}
      onChange={(event, newValue) => setValue(newValue)}
      value={value}
      renderInput={(params) => (
        <Grid container spacing={1} alignItems="center">
          <Grid item>{startInputAvatar}</Grid>
          <Grid item xs>
            <TextField
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...params}
              variant="outlined"
              label={inputLabel}
              InputLabelProps={{
                classes: {
                  root: classes.inputLabel,
                  shrink: classes.inputLabelShrinked,
                },
              }}
            />
          </Grid>
        </Grid>
      )}
      renderOption={(option) => (
        <Tooltip title={option[nameField]} arrow>
          <>
            <ListItemAvatar>
              {option.avatar ? <option.avatar /> : <TextAvatar name={option[nameField]} />}
            </ListItemAvatar>
            <ListItemText
              primary={option[nameField]}
              secondary={getSecondaryText(option)}
              primaryTypographyProps={{ noWrap: true }}
              secondaryTypographyProps={{ noWrap: true }}
            />
          </>
        </Tooltip>
      )}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...autoCompleteProps}
    />
  );
};

CustomAutoComplete.propTypes = {
  nameField: PropTypes.string.isRequired,
  inputLabel: PropTypes.string.isRequired,
  setPendingValue: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  getSecondaryText: PropTypes.func.isRequired,
  autoCompleteProps: PropTypes.shape({}),
  value: PropTypes.shape({ avatar: PropTypes.elementType }),
};

CustomAutoComplete.defaultProps = {
  autoCompleteProps: {},
  value: null,
};

export default CustomAutoComplete;
