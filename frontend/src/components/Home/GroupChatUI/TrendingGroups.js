import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  AvatarGroup,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CustomAvatar from 'components/Avatar';

const useStyles = makeStyles((theme) => ({
  groupCard: {
    // height: '80%',
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
  const classes = useStyles();
  return (
    <Grid container direction="column" alignItems="flex-start">
      <Grid item>
        <Typography variant="h4" className={classes.trendingGroupsTitle}>
          Trending Rooms <TrendingUpIcon />
        </Typography>
      </Grid>
      <Grid item xs container>
        {trendingGroups.map((group) => (
          <Grid item key={group.id} xs>
            <Card elevation={2} className={classes.groupCard}>
              <Grid
                container
                direction="column"
                style={
                  {
                    // height: '100%',
                  }
                }
                spacing={1}
              >
                <Grid item>
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
                </Grid>
                <Grid item xs>
                  <CardContent>
                    <Typography paragraph>{group.description}</Typography>
                  </CardContent>
                </Grid>
                <Grid item>
                  <CardActions>
                    <Grid item container justifyContent="space-between">
                      <Grid item>
                        <AvatarGroup max={4}>
                          {group.online_users.map((user) => {
                            const chatSession = user.chat_session;
                            return (
                              <CustomAvatar
                                key={chatSession.session_id}
                                name={chatSession.name}
                                avatarUrl={`${chatSession.avatar_url}?background=%23bdbdbd`}
                              />
                            );
                          })}
                        </AvatarGroup>
                      </Grid>
                      <Grid item>
                        <Button
                          color="secondary"
                          variant="contained"
                          size="medium"
                          onClick={() => onStartChat(group)}
                        >
                          Enter Room
                        </Button>
                      </Grid>
                    </Grid>
                  </CardActions>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Grid>
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
