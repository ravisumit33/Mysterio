import React from 'react';
import Jumbotron from './Jumbotron';
import HowItWorks from './HowItWorks';
import ChatExperience from './ChatExperience';
import AppDownload from './AppDownload';
import FAQ from './FAQ';
import CTA from './CTA';

function Home() {
  return (
    <>
      <Jumbotron />
      <HowItWorks />
      <ChatExperience />
      <AppDownload />
      <FAQ />
      <CTA />
    </>
  );
}

export default Home;
