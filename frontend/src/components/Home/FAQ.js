import React from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function FAQ() {
  const theme = useTheme();
  const faqs = [
    {
      id: 'faq-1',
      question: 'What is Mysterio?',
      answer:
        "Mysterio is a platform that lets you chat anonymously with people worldwide. It's a place where you can express yourself freely and connect with others without revealing your identity.",
    },
    {
      id: 'faq-2',
      question: 'Is it really anonymous?',
      answer:
        "Yes, it's completely anonymous. We don't collect any personal information, and you don't need to create an account to start chatting.",
    },
    {
      id: 'faq-3',
      question: 'Is Mysterio really free?',
      answer:
        'Yes, Mysterio is completely free to use. There are no hidden fees or subscriptions. Only the premium features require payment.',
    },
    {
      id: 'faq-4',
      question: 'How does the end-to-end encryption work?',
      answer:
        "Our end-to-end encryption ensures that only you and the people you're chatting with can read your messages. Not even our servers can access the content of your conversations.",
    },
    {
      id: 'faq-5',
      question: 'Can I use Mysterio on my mobile device?',
      answer:
        'Yes, you can use either our website or our mobile apps on your mobile device. Mysterio works on all devices including smartphones, tablets, laptops and desktop computers.',
    },
    {
      id: 'faq-6',
      question: 'Do you store any user data?',
      answer:
        'We do not store user identities or connection information. For group rooms, only the encrypted messages are stored until the group room is deleted. In dual chats, session data is deleted as soon as you close your chat windows.',
    },
    {
      id: 'faq-7',
      question: 'What all video platforms are supported in watch together feature?',
      answer:
        'We currently support YouTube videos, however, we have planned to include DailyMotion, Vimeo and even your own video as well. Stay tuned.',
    },
    {
      id: 'faq-8',
      question: 'What types of games are available?',
      answer:
        'Currently we support 2 player games in dual chats. We have planned to support multiplayer games in group room chats. Stay tuned.',
    },
  ];

  return (
    <Box
      id="faq"
      sx={{
        py: 12,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'grey.100',
        color: 'grey.900',
        scrollMarginTop: (tm) => tm.mixins.toolbar.minHeight,
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto', mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: theme.typography.fontWeightBold,
              mb: 2,
              color: 'text.primary',
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: theme.typography.fontWeightRegular,
            }}
          >
            Got questions? We&apos;ve got answers. If you don&apos;t see what you&apos;re looking
            for, feel free to contact us.
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {faqs.map((faq) => (
            <Accordion
              key={faq.id}
              sx={{
                mb: 2,
                borderRadius: '8px !important',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:before': {
                  display: 'none',
                },
                '&.Mui-expanded': {
                  margin: '8px 0',
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: 'background.paper',
                  borderRadius: '8px',
                  minHeight: '40px !important',
                  py: 1,
                  '&.Mui-expanded': {
                    minHeight: '40px !important',
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  },
                  '& .MuiAccordionSummary-content': {
                    margin: '0',
                    '&.Mui-expanded': {
                      margin: '0',
                    },
                  },
                  '&:hover .MuiTypography-root': {
                    textDecoration: 'underline',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: theme.typography.fontWeightBold,
                    color: 'text.primary',
                    transition: 'text-decoration 0.2s ease',
                  }}
                >
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  backgroundColor: 'background.paper',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  py: 1,
                  px: 3,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default FAQ;
