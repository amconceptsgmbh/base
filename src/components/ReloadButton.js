// src/components/ReloadButton.js

import React from 'react';

// ReloadButton Component
function ReloadButton() {
  // Function to handle the deep reload and redirect to the base URL
  const handleDeepReload = function() {
    //window.location.href = window.location.origin;
    window.location.replace(window.location.origin); //for a history-replacing reload
  };

  // Return the button element using React.createElement instead of JSX
  return React.createElement(
    'button',
    {
      onClick: handleDeepReload,
      className: 'btn primary-accent m-2' // Apply the CSS class here
      //style: { padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }
    },
    'App Restart'
  );
}

export default ReloadButton;
