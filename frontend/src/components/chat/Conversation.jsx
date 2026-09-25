import { ArrowUpRight } from 'lucide-react';
import { STARTER_PROMPTS } from '../../data/chat.js';

function Message({ message }) {
  const { agent, content, role } = message;

  return (
    <article className={`message message-${role}`}>
      {role === 'assistant' && agent && (
        <p className="message-author">
          <span className="message-agent-name">{agent.name}</span>
          <span className="message-agent-role">{agent.role}</span>
        </p>
      )}
      <div className="message-copy">
        <p>{content}</p>
      </div>
    </article>
  );
}

function EmptyConversation({ error, onPromptSelect }) {
  return (
    <div className="chat-thread chat-thread-empty">
      <div className="empty-conversation">
        <span className="empty-conversation-rule" aria-hidden="true" />
        <h2>A little context goes a long way.</h2>
        <p>
          Start with a question about your codebase. SALVAL will help you find
          the right place to begin.
        </p>
        <div className="conversation-prompts">
          {STARTER_PROMPTS.map((prompt) => (
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
      {error && <p className="chat-error" role="alert">{error}</p>}
    </div>
  );
}

export default function Conversation({ messages, error, onPromptSelect }) {
  if (messages.length === 0) {
    return <EmptyConversation error={error} onPromptSelect={onPromptSelect} />;
  }

  return (
    <div className="chat-thread">
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      {error && <p className="chat-error" role="alert">{error}</p>}
    </div>
  );
}
