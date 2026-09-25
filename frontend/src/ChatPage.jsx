import { useState } from 'react';
import { ArrowUp, ArrowUpRight, Moon, Sun } from 'lucide-react';
import './chat-page.css';

const AGENTS = [
  { id: 'main', name: 'SALVAL', role: 'Main Agent' },
  { id: 'debug', name: 'Salma', role: 'Debugger Agent' },
  { id: 'ui', name: 'Valerie', role: 'UI/UX Agent' },
  { id: 'code', name: 'Leo', role: 'Code Agent' },
];

const INITIAL_AGENT = null;
const DEFAULT_AGENT = AGENTS[0];

function getAgentById(agentId) {
  return AGENTS.find((agent) => agent.id === agentId) ?? DEFAULT_AGENT;
}

function getConversationTitle(messages) {
  const firstUserMessage = messages.find((message) => message.role === 'user');

  if (!firstUserMessage) {
    return 'New conversation';
  }

  const title = firstUserMessage.content.trim();
  return title.length > 36 ? `${title.slice(0, 36).trimEnd()}…` : title;
}

function Message({ role, agent, children }) {
  return (
    <article className={`message message-${role}`}>
      {role === 'assistant' && agent && (
        <p className="message-author">
          <span className="message-agent-name">{agent.name}</span>
          <span className="message-agent-role">{agent.role}</span>
        </p>
      )}
      <div className="message-copy">{children}</div>
    </article>
  );
}

function AgentList({ activeAgent }) {
  return (
    <section className="agent-section" aria-label="SALVAL agents">
      <h2 className="agent-section-heading">AGENTS</h2>
      <ul className="agent-list">
        {AGENTS.map((agent) => {
          const isActive = agent.name === activeAgent;

          return (
            <li
              className={`agent-list-item${isActive ? ' is-active' : ''}`}
              key={agent.name}
              aria-current={isActive ? 'true' : undefined}
            >
              <span className="agent-name">{agent.name}</span>
              <span className="agent-role">{agent.role}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ThemeToggle({ darkMode, onToggle }) {
  const label = darkMode ? 'Switch to light mode' : 'Switch to dark mode';
  const Icon = darkMode ? Sun : Moon;

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
    >
      <Icon size={16} />
    </button>
  );
}

function Conversation({ messages, error, onPromptSelect }) {
  if (messages.length === 0) {
    return (
      <div className="chat-thread chat-thread-empty">
        <div className="empty-conversation">
          <span className="empty-conversation-rule" aria-hidden="true" />
          <h2>A little context goes a long way.</h2>
          <p>
            Start with a question about your codebase. SALVAL will help you
            find the right place to begin.
          </p>
          <div className="conversation-prompts">
            {[
              'Help me understand this project',
              'I am stuck on an error',
              'Take a look at this interface',
            ].map((prompt) => (
              <button
                className="conversation-prompt"
                key={prompt}
                onClick={() => onPromptSelect(prompt)}
                type="button"
              >
                {prompt}
                <ArrowUpRight aria-hidden="true" size={15} />
              </button>
            ))}
          </div>
        </div>
        {error && (
          <p className="chat-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="chat-thread">
      {messages.map((message) => (
        <Message
          key={message.id}
          role={message.role}
          agent={message.agent}
        >
          <p>{message.content}</p>
        </Message>
      ))}

      {error && (
        <p className="chat-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Composer({ value, isSending, onChange, onSubmit }) {
  return (
    <>
      <form className="composer" onSubmit={onSubmit}>
        <textarea
          aria-label="Message SALVAL"
          maxLength={1000}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Message SALVAL..."
          rows={2}
          value={value}
          disabled={isSending}
        />
        <div className="composer-bottom">
          <span aria-live="polite">
            {isSending ? 'Routing to an agent…' : 'Project context · demo'}
          </span>
          <button
            type="submit"
            disabled={!value.trim() || isSending}
            aria-label="Send message"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </form>
      <p className="composer-footnote">
        A little more context. A lot less explaining.
      </p>
    </>
  );
}

export default function ChatPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [activeAgent, setActiveAgent] = useState(INITIAL_AGENT);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const conversationTitle = getConversationTitle(messages);

  async function handleSend(event) {
    event.preventDefault();

    const message = draft.trim();
    if (!message || isSending) return;

    const messageId = Date.now().toString();
    setMessages((current) => [
      ...current,
      { id: `${messageId}-user`, role: 'user', content: message },
    ]);
    setDraft('');
    setError('');
    setActiveAgent('SALVAL');
    setIsSending(true);

    try {
      const response = await fetch('/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: message, code: '' }),
      });

      if (!response.ok) {
        throw new Error('The chat request failed.');
      }

      const data = await response.json();
      const agent = getAgentById(data.routed_to);

      setMessages((current) => [
        ...current,
        {
          id: `${messageId}-assistant`,
          role: 'assistant',
          content: data.result,
          agent,
        },
      ]);
      setActiveAgent(agent.name);
    } catch {
      setError('SALVAL could not connect. Check that the backend is running.');
      setActiveAgent('SALVAL');
    } finally {
      setIsSending(false);
    }
  }

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
          <div className="chats-heading">
            <span>CHAT</span>
          </div>
          <nav className="chat-list" aria-label="Current conversation">
            <div className="chat-list-item is-current" aria-current="page">
              {conversationTitle}
            </div>
          </nav>
          <AgentList activeAgent={activeAgent} />
        </aside>

        <main className="chat-page-main">
          <div className="chat-title-block">
            <h1>{conversationTitle}</h1>
            <p className="chat-context-line">
              A conversation with your project in context.
            </p>
          </div>

          <Conversation
            messages={messages}
            error={error}
            onPromptSelect={setDraft}
          />
          <Composer
            value={draft}
            isSending={isSending}
            onChange={setDraft}
            onSubmit={handleSend}
          />
        </main>
      </div>
    </div>
  );
}
