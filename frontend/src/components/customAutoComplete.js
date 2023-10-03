import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Autocomplete,
  Avatar,
  Grid,
  ListItemAvatar,
  ListItemText,
  TextField,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import SearchIcon from '@mui/icons-material/Search';
import CustomAvatar from './Avatar';

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

function CustomAutoComplete(props) {
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
  const searchIconAvatar = useMemo(
    () => (
      <Avatar>
        <SearchIcon />
      </Avatar>
    ),
    []
  );
  let startInputAvatar;
  if (value) {
    startInputAvatar = value.avatar ? (
      <value.avatar />
    ) : (
      <CustomAvatar name={value[nameField]} avatarUrl={value.avatar_url} />
    );
  } else {
    startInputAvatar = searchIconAvatar;
  }
  return (
    <Autocomplete
      size="small"
      onInputChange={(event, newPendingValue) => setPendingValue(newPendingValue)}
      onChange={(event, newValue) => setValue(newValue)}
      value={value}
      renderInput={(params) => (
        <Grid container columnSpacing={1} alignItems="center">
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
              inputProps={{ ...params.inputProps, maxLength: 20 }}
            />
          </Grid>
        </Grid>
      )}
      renderOption={(p, option) => (
        <Tooltip title={option[nameField]} arrow key={option.id}>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <li {...p}>
            <ListItemAvatar>
              {option.avatar ? (
                <option.avatar />
              ) : (
                <CustomAvatar name={option[nameField]} avatarUrl={option.avatar_url} />
              )}
            </ListItemAvatar>
            <ListItemText
              primary={option[nameField]}
              secondary={getSecondaryText(option)}
              primaryTypographyProps={{ noWrap: true }}
              secondaryTypographyProps={{ noWrap: true }}
            />
          </li>
        </Tooltip>
      )}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...autoCompleteProps}
    />
  );
}

CustomAutoComplete.propTypes = {
  nameField: PropTypes.string.isRequired,
  inputLabel: PropTypes.string.isRequired,
  setPendingValue: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  getSecondaryText: PropTypes.func.isRequired,
  autoCompleteProps: PropTypes.shape({}),
  value: PropTypes.shape({ avatar: PropTypes.elementType, avatar_url: PropTypes.string }),
};

CustomAutoComplete.defaultProps = {
  autoCompleteProps: {},
  value: null,
};

export default CustomAutoComplete;
