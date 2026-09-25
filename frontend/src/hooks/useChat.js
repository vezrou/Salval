import { useState, useRef } from 'react';
import { getAgent } from '../data/chat.js';

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [activeAgent, setActiveAgent] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  // Persists the session_id returned by the backend so every follow-up
  // message in this conversation is sent with the same id.
  const sessionIdRef = useRef('');

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
      const response = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: content,
          code: '',
          session_id: sessionIdRef.current,
        }),
      });

      if (!response.ok) {
        throw new Error('The chat request failed.');
      }

      const data = await response.json();

      // Store the session_id returned by the server for subsequent messages
      if (data.session_id) {
        sessionIdRef.current = data.session_id;
      }

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
