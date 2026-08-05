import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Production API URL interceptor to support separate Render backend hosting on Vercel deployments
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  if (typeof url === 'string' && url.startsWith('/api')) {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    if (apiUrl.startsWith('http')) {
      // Convert '/api/auth/login' -> 'https://elevatex-backend.onrender.com/api/auth/login'
      url = url.replace('/api', `${apiUrl.replace(/\/$/, '')}/api`);
    }
  }
  return originalFetch(url, options);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
