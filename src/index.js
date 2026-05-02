// ============================================================================
// FILE: src/index.js
// PURPOSE: Entry point of the React application
// ============================================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css'; // <--- ✅ CHANGED: Importing App.css instead of index.css
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);