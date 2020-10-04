import React from 'react';
import Jumbotron from './Jumbotron';
import Features from './Features';

class Home extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Jumbotron />
        <Features />
      </React.Fragment>
    );
  }
}

export default Home;
