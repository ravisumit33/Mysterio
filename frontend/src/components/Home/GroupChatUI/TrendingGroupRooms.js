import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
  AvatarGroup,
  useTheme,
  Stack,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import MobileStepper from '@mui/material/MobileStepper';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import CustomAvatar from 'components/Avatar';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const useStyles = makeStyles((theme) => ({
  roomCard: {
    height: theme.spacing(33),
    display: 'flex',
    flexDirection: 'column',
  },
  roomCardAvatar: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  trendingRoomsTitle: {
    [theme.breakpoints.down('md')]: {
      textAlign: 'center',
    },
    margin: theme.spacing(1, 0),
  },
}));

function TrendingGroupRooms(props) {
  const { trendingGroupRooms, onStartChat } = props;
  const theme = useTheme();
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  return (
    <Stack>
      <Typography variant="h4" className={classes.trendingRoomsTitle}>
        Trending Rooms <TrendingUpIcon />
      </Typography>
      {/* @ts-ignore */}
      <AutoPlaySwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={activeStep}
        onChangeIndex={handleStepChange}
        enableMouseEvents
        // Adding padding to slides to solve no elevation on card issue
        slideStyle={{ padding: theme.spacing(1) }}
      >
        {trendingGroupRooms.map((room) => (
          <Card elevation={2} className={classes.roomCard} key={room.id}>
            <CardHeader
              avatar={
                <CustomAvatar
                  name={room.room_data.name}
                  avatarUrl={room.room_data.avatar_url}
                  className={classes.roomCardAvatar}
                />
              }
              title={room.room_data.name}
              titleTypographyProps={{
                variant: 'h5',
              }}
              subheader={`${room.message_count} messages`}
            />
            <CardContent sx={{ flex: 1 }}>
              <Typography
                paragraph
                sx={{ hyphens: 'auto', textOverflow: 'ellipsis', overflow: 'hidden' }}
              >
                {room.description}
              </Typography>
            </CardContent>
            <CardActions>
              <AvatarGroup max={4}>
                {room.online_users.map((user) => {
                  const chatSession = user.chat_session;
                  return (
                    <CustomAvatar
                      key={chatSession.session_id}
                      name={chatSession.name}
                      avatarUrl={`${chatSession.avatar_url}`}
                    />
                  );
                })}
              </AvatarGroup>
              <Button
                color="secondary"
                variant="contained"
                size="medium"
                onClick={() => onStartChat(room)}
                sx={{ ml: 'auto' }}
              >
                Enter Room
              </Button>
            </CardActions>
          </Card>
        ))}
      </AutoPlaySwipeableViews>
      <MobileStepper
        sx={{ mx: 1 }}
        steps={trendingGroupRooms.length}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button
            size="small"
            onClick={handleNext}
            disabled={activeStep === trendingGroupRooms.length - 1}
          >
            Next
            {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
          </Button>
        }
        backButton={
          <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
            {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            Back
          </Button>
        }
      />
    </Stack>
  );
}

TrendingGroupRooms.propTypes = {
  trendingGroupRooms: PropTypes.arrayOf(PropTypes.shape({})),
  onStartChat: PropTypes.func.isRequired,
};

TrendingGroupRooms.defaultProps = {
  trendingGroupRooms: [],
};

export default TrendingGroupRooms;
