// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './services/firebase/config' // Initialize Firebase
import { initDevErrorSuppression } from './utils/devErrorSuppression'

// Initialize development error suppression
initDevErrorSuppression();

// console.log('main.jsx loaded');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found!');
  } else {
    // console.log('Root element found, creating React root');
    const root = ReactDOM.createRoot(rootElement);
    // console.log('Rendering App component');
    root.render(
      <App />
    );
    // console.log('App rendered');
  }
} catch (error) {
  console.error('Error mounting React app:', error);
  // Show error in the UI
  document.body.innerHTML = `
    <div style="padding: 20px; color: white; background: black; font-family: monospace;">
      <h1>Error loading application</h1>
      <pre>${error.toString()}</pre>
      <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: orange; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Reload Page
      </button>
    </div>
  `;
}

// Call the global function to remove loader after React renders
setTimeout(() => {
  if (window.removeInitialLoader) {
    window.removeInitialLoader();
  }
  // Also force remove the initial loader element directly
  const initialLoader = document.getElementById('initial-loader');
  if (initialLoader) {
    initialLoader.remove();
  }
}, 100);
