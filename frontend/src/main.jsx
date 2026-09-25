import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/colors.css';
import './styles/typography.css';
import './styles/base.css';
import App from './App.jsx';
import ChatPage from './ChatPage.jsx';

const isChatPage = window.location.pathname.replace(/\/$/, '') === '/chat';
const Page = isChatPage ? ChatPage : App;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>,
);
