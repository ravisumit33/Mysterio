import React from 'react';
import { Box, Button, Stack } from '@mui/material';
import { makeStyles } from '@mui/styles';
import RouterLink from 'components/RouterLink';
import CenterPaper from 'components/CenterPaper';
import Notification from 'components/Notification';
import notFoundJson from 'assets/animations/not-found.json';
import WaitScreen from 'components/WaitScreen';
import { ChatProvider } from 'providers';
import { ChatHydrationContext } from 'contexts';
import { useHydrateChatData } from 'hooks';
import { ChatHydrationStatus } from 'appConstants';
import ChatExperience from './ChatExperience';

const useStyles = makeStyles((theme) => ({
  error: {
    marginBottom: theme.spacing(2),
  },
}));

function ChatContainer() {
  const { status, chatData } = useHydrateChatData();
  const classes = useStyles();

  if (status === ChatHydrationStatus.LOADING) {
    return <WaitScreen shouldOpen />;
  }

  if (status === ChatHydrationStatus.READY) {
    return (
      <ChatHydrationContext.Provider value={chatData}>
        <ChatProvider>
          <ChatExperience />
        </ChatProvider>
      </ChatHydrationContext.Provider>
    );
  }

  return (
    <Box width="100%">
      <CenterPaper>
        <Stack justifyContent="space-around" spacing={2}>
          <Notification
            animationProps={{
              containerId: 'chatInitializationError',
              containerClassName: classes.error,
              animationData: notFoundJson,
              width: 40,
              height: 40,
            }}
            title="Chat initialization failed!!"
            description="Error occurred in initalizing this chat session. Go to home to start a new chat."
          />
          <RouterLink to="/" tabIndex={-1} style={{ alignSelf: 'center' }}>
            <Button color="secondary" variant="contained" size="large">
              Home
            </Button>
          </RouterLink>
        </Stack>
      </CenterPaper>
    </Box>
  );
}

export default ChatContainer;
