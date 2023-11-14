import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Autocomplete,
  Avatar,
  ListItemAvatar,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import SearchIcon from '@mui/icons-material/Search';

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
    getName,
    getAvatar,
    inputLabel,
    value,
    setPendingValue,
    setValue,
    getSecondaryText,
    autoCompleteProps,
  } = props;
  const classes = useStyles();
  const startInputAvatar = useMemo(() => {
    if (value) {
      return getAvatar(value);
    }
    return (
      <Avatar>
        <SearchIcon />
      </Avatar>
    );
  }, [getAvatar, value]);

  return (
    <Autocomplete
      size="small"
      onInputChange={(event, newPendingValue) => setPendingValue(newPendingValue)}
      onChange={(event, newValue) => setValue(newValue)}
      value={value}
      renderInput={(params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          {startInputAvatar}
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
        </Stack>
      )}
      renderOption={(p, option) => (
        <Tooltip title={getName(option)} arrow key={option.id}>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <li {...p}>
            <ListItemAvatar>{getAvatar(option)}</ListItemAvatar>
            <ListItemText
              primary={getName(option)}
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
  getName: PropTypes.func.isRequired,
  getAvatar: PropTypes.func.isRequired,
  inputLabel: PropTypes.string.isRequired,
  setPendingValue: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  getSecondaryText: PropTypes.func.isRequired,
  autoCompleteProps: PropTypes.shape({}),
  value: PropTypes.shape({ id: PropTypes.number }),
};

CustomAutoComplete.defaultProps = {
  autoCompleteProps: {},
  value: null,
};

export default CustomAutoComplete;
