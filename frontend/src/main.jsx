import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/colors.css';
import './styles/typography.css';
import './styles/base.css';
import App from './App.jsx';
import ChatPage from './ChatPage.jsx';

function PageRouter() {
  const [isChatPage, setIsChatPage] = useState(
    window.location.hash === '#chat',
  );

  useEffect(() => {
    function updatePage() {
      setIsChatPage(window.location.hash === '#chat');
    }

    window.addEventListener('hashchange', updatePage);

    return () => window.removeEventListener('hashchange', updatePage);
  }, []);

  return isChatPage ? <ChatPage /> : <App />;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PageRouter />
  </React.StrictMode>,
);
