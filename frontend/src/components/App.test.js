import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders work in progress', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/work in progress/i);
  expect(linkElement).toBeInTheDocument();
});
