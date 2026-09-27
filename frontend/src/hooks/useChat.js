import { useState, useRef } from 'react';
import { getAgent } from '../data/chat.js';

const API = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

async function request(path, body, timeout = 180_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(`${API}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(typeof data?.detail === 'string' ? data.detail : 'Request failed. Please retry.');
    }
    if (!data) throw new Error('The API returned an invalid response. Check the backend connection.');
    return data;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('The request timed out. Please retry.');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function waitForServer() {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const data = await request('/ping', null, Math.min(5000, deadline - Date.now()));
      if (data.status === 'ok') return;
    } catch { /* Retry while the backend wakes up. */ }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error('SALVAL could not reach the backend. Please try again in a moment.');
}

function normalizeRepo(value) {
  let url;
  try { url = new URL(value.trim()); } catch { throw new Error('Enter a GitHub URL such as https://github.com/owner/repo'); }
  const parts = url.pathname.replace(/\/$/, '').split('/').filter(Boolean);
  if (url.protocol !== 'https:' || url.host !== 'github.com' || url.username || url.password || parts.length !== 2 ||
      !parts.every((part) => /^[a-zA-Z0-9_.-]+$/.test(part))) {
    throw new Error('Use a repository root URL: https://github.com/owner/repo');
  }
  return `https://github.com/${parts[0]}/${parts[1].replace(/\.git$/, '')}`;
}

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [activeAgent, setActiveAgent] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [repoError, setRepoError] = useState('');
  const [status, setStatus] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [project, setProject] = useState(null);
  const sessionIdRef = useRef('');
  const busyRef = useRef(false);

  async function loadRepository(url) {
    setIsAnalyzing(true);
    setRepoError('');
    try {
      setStatus('waking');
      await waitForServer();
      setStatus('scanning');
      // New session prevents history from another project leaking into this one.
      const data = await request('/analyze', { repo_url: url }, 240_000);
      if (!data.session_id || !data.context?.summary) throw new Error('Analysis was incomplete. Please retry.');
      sessionIdRef.current = data.session_id;
      setProject({ ...data, url });
      setMessages([]);
      setActiveAgent(null);
      setError('');
      return data;
    } finally {
      setIsAnalyzing(false);
      setStatus('');
    }
  }

  async function analyzeRepository(event) {
    event.preventDefault();
    if (busyRef.current) return;
    busyRef.current = true;
    setRepoError('');
    try { await loadRepository(normalizeRepo(repoUrl)); }
    catch (err) { setRepoError(err.message); }
    finally { busyRef.current = false; }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || busyRef.current) return;
    busyRef.current = true;
    setIsSending(true);
    setError('');
    let phase = 'analyze';
    let pendingId = null;
    try {
      if (repoUrl.trim()) {
        const url = normalizeRepo(repoUrl);
        if (url !== project?.url) await loadRepository(url);
      } else if (project) {
        throw new Error('Enter a repository URL to switch projects, or keep the loaded URL.');
      }
      phase = 'build';
      setStatus('waking');
      await waitForServer();
      setStatus('');
      setActiveAgent('SALVAL');
      pendingId = `${Date.now()}-user`;
      setMessages((current) => [...current, { id: pendingId, role: 'user', content }]);
      setDraft('');
      const data = await request('/build', {
        command: content, code: '', session_id: sessionIdRef.current,
      }, 300_000);
      if (typeof data.result !== 'string') throw new Error('The agent returned an invalid response. Please retry.');
      sessionIdRef.current = data.session_id;
      const agent = getAgent(data.routed_to);
      const id = Date.now().toString();
      setMessages((current) => [...current,
        { id: `${id}-assistant`, role: 'assistant', content: data.result, agent },
      ]);
      setDraft('');
      setActiveAgent(agent.name);
    } catch (err) {
      if (pendingId) {
        setMessages((current) => current.filter((message) => message.id !== pendingId));
        setDraft(content);
      }
      if (phase === 'analyze') setRepoError(err.message);
      else setError(err.message);
    } finally {
      busyRef.current = false;
      setIsSending(false);
      setStatus('');
    }
  }

  return { activeAgent, draft, error, isSending, isAnalyzing, messages, sendMessage,
    setDraft, status, repoUrl, setRepoUrl, project, repoError, analyzeRepository };
}
