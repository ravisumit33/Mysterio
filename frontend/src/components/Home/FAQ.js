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
      answer: "Mysterio is a platform that lets you chat anonymously with people worldwide. It's a place where you can express yourself freely and connect with others without revealing your identity.",
    },
    {
      id: 'faq-2',
      question: 'Is it really anonymous?',
      answer: "Yes, it&apos;s completely anonymous. We don&apos;t collect any personal information, and you don&apos;t need to create an account to start chatting.",
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
        'Yes you can use either our website or our mobile apps on you mobile device. Mysterio works on all devices including smartphones, tablets, laptops and desktop computes.',
    },
    {
      id: 'faq-6',
      question: 'Do you store any user data?',
      answer:
        'We do not store user identities or connection information. For group rooms, only the encrypted messages are stored til the group room is not deleted. In dual chats, session data is deleted as soon as you close your chat windows.',
    },
    {
      id: 'faq-7',
      question: 'What all video platforms are supported in watch together feature?',
      answer:
        'We currently support Youtube videos, however, we have planned to include DailyMotion, vimeo and even your own video as well. Stay tuned.',
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
        background: 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 100%)',
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              color: 'text.primary',
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
            }}
          >
            Got questions? We've got answers. If you don't see what you're looking for, feel free to
            contact us.
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
                  margin: '16px 0',
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: 'background.paper',
                  borderRadius: '8px',
                  minHeight: '48px !important',
                  '&.Mui-expanded': {
                    minHeight: '48px !important',
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
                    fontWeight: 600,
                    color: 'text.primary',
                    transition: 'text-decoration 0.2s ease',
                    lineHeight: '48px',
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
                  padding: '8px 24px',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.6,
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
