// ============================================================================
// FILE: src/index.js
// PURPOSE: Entry point of the React application
// DESCRIPTION: This file renders the App component into the HTML DOM
// ============================================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';

// Get the root element from public/index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component
// StrictMode helps identify potential problems in the app during development
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);