import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from '@mui/material';

function TooltipButton(props) {
  const { children, title } = props;
  /*
   * Tooltip needs to listen to the child element's events to display the title.
   * Buttons can be disabled and thus cannot fire events.
   * Wrap them into a span
   */
  return (
    <Tooltip title={title} arrow>
      <span>{children}</span>
    </Tooltip>
  );
}

TooltipButton.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default TooltipButton;
