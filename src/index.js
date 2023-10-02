import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';

const root = createRoot(document.getElementById('root'));

root.render(
<Auth0Provider
    domain="envy-ai-test.us.auth0.com"
    clientId="LbdBZOa9vYTtXHDmm0qKn2hjQUPvI0Iy"
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    <App />
  </Auth0Provider>,
)

