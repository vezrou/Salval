import { useState, useRef } from 'react';
import { getAgent } from '../data/chat.js';

const API = import.meta.env.VITE_API_URL ?? '';
const WAKE_TIMEOUT_MS = 60_000; // 60s — enough for Render cold start

/**
 * Ping the backend and wait until it responds or the timeout is reached.
 * Returns true if the server is up, false if it timed out.
 */
async function waitForServer() {
  const deadline = Date.now() + WAKE_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${API}/ping`, { method: 'GET' });
      if (res.ok) return true;
    } catch {
      // still sleeping — wait 3s and try again
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return false;
}

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [activeAgent, setActiveAgent] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(''); // "waking" | ""

  // Persists the session_id returned by the backend so every follow-up
  // message in this conversation is sent with the same id.
  const sessionIdRef = useRef('');

  async function sendMessage(event) {
    event.preventDefault();

    const content = draft.trim();
    if (!content || isSending) return;

    const id = Date.now().toString();
    setMessages((current) => [...current, {
      id: `${id}-user`,
      role: 'user',
      content,
    }]);
    setDraft('');
    setError('');
    setIsSending(true);

    try {
      // Wake the server first — handles Render free-tier cold starts
      setStatus('waking');
      const isUp = await waitForServer();
      setStatus('');

      if (!isUp) {
        setError('SALVAL is taking too long to wake up. Please try again in a moment.');
        return;
      }

      setActiveAgent('SALVAL');
      const response = await fetch(`${API}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: content,
          code: '',
          session_id: sessionIdRef.current,
        }),
      });

      if (!response.ok) throw new Error('Request failed');

      const data = await response.json();

      if (data.session_id) sessionIdRef.current = data.session_id;

      const agent = getAgent(data.routed_to);
      setMessages((current) => [...current, {
        id: `${id}-assistant`,
        role: 'assistant',
        content: data.result,
        agent,
      }]);
      setActiveAgent(agent.name);
    } catch {
      setError('SALVAL could not connect. Please try again.');
      setActiveAgent('SALVAL');
    } finally {
      setIsSending(false);
      setStatus('');
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
    status,
  };
}
