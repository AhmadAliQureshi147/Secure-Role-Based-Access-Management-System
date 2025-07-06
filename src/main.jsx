import React from 'react';
import { createRoot } from 'react-dom/client'; // Updated import
import App from './App';
import { ContextProvider } from './context/context.jsx';
import './index.css';

const container = document.getElementById('root'); // Get the root element
const root = createRoot(container); // Create a root instance

root.render(
  <ContextProvider>
    <App />
  </ContextProvider>
); // Render the app inside the ContextProvider
