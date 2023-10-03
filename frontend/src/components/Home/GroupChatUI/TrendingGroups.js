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
  groupCard: {
    height: theme.spacing(33),
    display: 'flex',
    flexDirection: 'column',
  },
  groupCardAvatar: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  trendingGroupsTitle: {
    [theme.breakpoints.down('md')]: {
      textAlign: 'center',
    },
    margin: theme.spacing(1, 0),
  },
}));

function TrendingGroups(props) {
  const { trendingGroups, onStartChat } = props;
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
      <Typography variant="h4" className={classes.trendingGroupsTitle}>
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
        {trendingGroups.map((group) => (
          <Card elevation={2} className={classes.groupCard} key={group.id}>
            <CardHeader
              avatar={
                <CustomAvatar
                  name={group.name}
                  avatarUrl={group.avatar_url}
                  className={classes.groupCardAvatar}
                />
              }
              title={group.name}
              titleTypographyProps={{
                variant: 'h5',
              }}
              subheader={`${group.message_count} messages`}
            />
            <CardContent sx={{ flex: 1 }}>
              <Typography
                paragraph
                sx={{ hyphens: 'auto', textOverflow: 'ellipsis', overflow: 'hidden' }}
              >
                {group.description}
              </Typography>
            </CardContent>
            <CardActions>
              <AvatarGroup max={4}>
                {group.online_users.map((user) => {
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
                onClick={() => onStartChat(group)}
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
        steps={trendingGroups.length}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button
            size="small"
            onClick={handleNext}
            disabled={activeStep === trendingGroups.length - 1}
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

TrendingGroups.propTypes = {
  trendingGroups: PropTypes.arrayOf(PropTypes.shape({})),
  onStartChat: PropTypes.func.isRequired,
};

TrendingGroups.defaultProps = {
  trendingGroups: [],
};

export default TrendingGroups;
