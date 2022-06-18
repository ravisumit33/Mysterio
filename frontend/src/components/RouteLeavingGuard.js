import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Prompt, useHistory } from 'react-router-dom';
import ConfirmationDialog from './ConfirmationDialog';

function RouteLeavingGuard(props) {
  const { when, shouldBlockNavigation, dialogProps } = props;
  const history = useHistory();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [toLocation, setToLocation] = useState(null);
  const [confirmedNavigation, setConfirmedNavigation] = useState(false);

  const handleBlockedNavigation = (nextLocation) => {
    if (!confirmedNavigation && shouldBlockNavigation(nextLocation)) {
      setDialogVisible(true);
      setToLocation(nextLocation);
      return false;
    }
    return true;
  };
  const handleConfirmNavigationClick = () => {
    setDialogVisible(false);
    setConfirmedNavigation(true);
  };
  useEffect(() => {
    if (confirmedNavigation && toLocation) {
      history.push(toLocation.pathname);
    }
  }, [confirmedNavigation, history, toLocation]);

  return (
    <>
      <Prompt when={when} message={handleBlockedNavigation} />
      <ConfirmationDialog
        shouldShow={dialogVisible}
        onCancel={() => setDialogVisible(false)}
        onConfirm={handleConfirmNavigationClick}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...dialogProps}
      />
    </>
  );
}

RouteLeavingGuard.propTypes = {
  when: PropTypes.bool,
  shouldBlockNavigation: PropTypes.func,
  dialogProps: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
};
RouteLeavingGuard.defaultProps = {
  when: true,
  shouldBlockNavigation: () => true,
};

export default RouteLeavingGuard;
