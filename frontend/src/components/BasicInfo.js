import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Button, Stack, TextField, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { generateRandomColor, resizeImg } from 'utils';
import { Face } from '@mui/icons-material';

const useStyles = makeStyles((theme) => ({
  avatar: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
}));

function BasicInfo(props) {
  const { name, onNameChange, nameProps, avatarUrl, setAvatarUrl, avatarProps } = props;
  const { error, label, helpText } = nameProps;
  const { DefaultIcon, styles } = avatarProps;

  const classes = useStyles();
  const theme = useTheme();
  const [randomClicked, setRandomClicked] = useState(false);

  const handleAvatarUpload = (evt) => {
    if (!evt.target.files) return;
    const [avatarImg] = evt.target.files;
    if (avatarImg) {
      let imageUrl = URL.createObjectURL(avatarImg);
      resizeImg(imageUrl, theme.spacing(7), theme.spacing(7)).then((resizedImg) => {
        URL.revokeObjectURL(imageUrl);
        imageUrl = URL.createObjectURL(resizedImg);
        setAvatarUrl(imageUrl);
      });
    }
  };

  const handleRandomAvatar = () => {
    if (!randomClicked) setRandomClicked(true);
    const style = styles[Math.floor(Math.random() * styles.length)];
    const randomAvatarUrl = encodeURI(
      `https://api.dicebear.com/7.x/${style}/svg?seed=${name}${Math.random()}&backgroundColor=${generateRandomColor()}`
    );
    setAvatarUrl(randomAvatarUrl);
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ alignSelf: 'center' }}>
        {avatarUrl ? (
          <Avatar className={classes.avatar} alt={name} src={avatarUrl} />
        ) : (
          <Avatar className={classes.avatar}>
            <DefaultIcon />
          </Avatar>
        )}
      </Box>
      <Stack direction="row" justifyContent="center" spacing={1}>
        <Button variant="contained" color="primary" component="label" size="small">
          Upload
          <input type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
        </Button>
        <Button variant="contained" color="primary" size="small" onClick={handleRandomAvatar}>
          Choose {!randomClicked ? 'random' : 'again'}
        </Button>
      </Stack>
      <TextField
        label={label}
        size="small"
        fullWidth
        value={name}
        onChange={(evt) => onNameChange(evt.target.value)}
        helperText={helpText}
        error={error}
        required
        inputProps={{ maxLength: 20 }}
      />
    </Stack>
  );
}

BasicInfo.propTypes = {
  name: PropTypes.string.isRequired,
  onNameChange: PropTypes.func.isRequired,
  nameProps: PropTypes.shape({
    error: PropTypes.bool,
    label: PropTypes.string,
    helpText: PropTypes.string,
  }),
  avatarUrl: PropTypes.string.isRequired,
  setAvatarUrl: PropTypes.func.isRequired,
  avatarProps: PropTypes.shape({
    DefaultIcon: PropTypes.elementType,
    styles: PropTypes.arrayOf(PropTypes.string),
  }),
};

BasicInfo.defaultProps = {
  nameProps: { error: false, label: 'name', helperText: '' },
  avatarProps: { DefaultIcon: () => <Face fontSize="large" />, styles: ['avataaars'] },
};

export default BasicInfo;
