import { useState } from 'react';
import AgentList from './components/chat/AgentList.jsx';
import ChatComposer from './components/chat/ChatComposer.jsx';
import Conversation from './components/chat/Conversation.jsx';
import ThemeToggle from './components/chat/ThemeToggle.jsx';
import { getConversationTitle } from './data/chat.js';
import useChat from './hooks/useChat.js';
import './styles/chat.css';

export default function ChatPage() {
  const [darkMode, setDarkMode] = useState(false);
  const {
    activeAgent,
    draft,
    error,
    isSending,
    messages,
    sendMessage,
    setDraft,
    status,
  } = useChat();
  const conversationTitle = getConversationTitle(messages);

  return (
    <div className="chat-page" data-theme={darkMode ? 'dark' : 'light'}>
      <header className="chat-page-topbar">
        <a className="chat-page-brand" href="/" aria-label="Back to SALVAL home">
          SALVAL
        </a>
        <ThemeToggle
          darkMode={darkMode}
          onToggle={() => setDarkMode((current) => !current)}
        />
      </header>

      <div className="chat-layout">
        <aside className="chat-sidebar" aria-label="Current chat">
          <div className="chats-heading">CHAT</div>
          <nav className="chat-list" aria-label="Current conversation">
            <div className="chat-list-item is-current" aria-current="page">
              {conversationTitle}
            </div>
          </nav>
          <AgentList activeAgent={activeAgent} />
        </aside>

        <main className="chat-page-main">
          <div className="chat-main-header">
            <header className="chat-title-block">
              <h1>{conversationTitle}</h1>
              <p className="chat-context-line">
                A conversation with your project in context.
              </p>
            </header>
          </div>

          <Conversation
            messages={messages}
            error={error}
            isSending={isSending}
            onPromptSelect={setDraft}
          />

          <div className="chat-composer-wrap">
            <ChatComposer
              value={draft}
              isSending={isSending}
              onChange={setDraft}
              onSubmit={sendMessage}
              status={status}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
