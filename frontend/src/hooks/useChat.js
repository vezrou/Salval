import { useState } from 'react';
import { getAgent } from '../data/chat.js';

const INITIAL_AGENT = null;

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [activeAgent, setActiveAgent] = useState(INITIAL_AGENT);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  async function sendMessage(event) {
    event.preventDefault();

    const content = draft.trim();

    if (!content || isSending) {
      return;
    }

    const id = Date.now().toString();
    const userMessage = {
      id: `${id}-user`,
      role: 'user',
      content,
    };

    setMessages((current) => [...current, userMessage]);
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
        body: JSON.stringify({ command: content, code: '' }),
      });

      if (!response.ok) {
        throw new Error('The chat request failed.');
      }

      const data = await response.json();
      const agent = getAgent(data.routed_to);
      const assistantMessage = {
        id: `${id}-assistant`,
        role: 'assistant',
        content: data.result,
        agent,
      };

      setMessages((current) => [...current, assistantMessage]);
      setActiveAgent(agent.name);
    } catch {
      setError('SALVAL could not connect. Check that the backend is running.');
      setActiveAgent('SALVAL');
    } finally {
      setIsSending(false);
    }
  }

  return {
    activeAgent,
    draft,
    error,
    isSending,
    messages,
    sendMessage,
    setDraft,
  };
}
