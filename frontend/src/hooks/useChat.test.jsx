// @vitest-environment jsdom
import { act, renderHook, waitFor, cleanup } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import useChat from './useChat.js';

const context = { stack: ['React'], components: ['Button'], hooks: [], css_tokens: [], summary: 'Reusable React UI' };
const event = () => ({ preventDefault() {} });
const ok = (data) => ({ ok: true, json: async () => data });

function mockApi(overrides = {}) {
  const fetch = vi.fn(async (url, options) => {
    if (overrides[url]) return overrides[url](options);
    if (url === '/ping') return ok({ status: 'ok' });
    if (url === '/analyze') return ok({ session_id: 'repo-session', files_analyzed: 4, context });
    if (url === '/build') return ok({ session_id: 'repo-session', routed_to: 'frontend', result: 'Reuse Button' });
    throw new Error(`Unexpected URL: ${url}`);
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test('analyzes the entered repo before sending and reuses its session on followups', async () => {
  const fetch = mockApi();
  const { result } = renderHook(() => useChat());
  act(() => { result.current.setRepoUrl('https://github.com/acme/ui'); result.current.setDraft('Add a button'); });
  await act(async () => result.current.sendMessage(event()));
  const calls = fetch.mock.calls.filter(([url]) => url !== '/ping');
  expect(calls.map(([url]) => url)).toEqual(['/analyze', '/build']);
  expect(JSON.parse(calls[1][1].body).session_id).toBe('repo-session');
  expect(result.current.project.context.summary).toBe(context.summary);
  expect(result.current.messages[1].agent.name).toBe('Maya');
  act(() => result.current.setDraft('Make it accessible'));
  await act(async () => result.current.sendMessage(event()));
  expect(fetch.mock.calls.filter(([url]) => url === '/analyze')).toHaveLength(1);
  expect(result.current.messages).toHaveLength(4);
});

test('failed analysis blocks generation and preserves the draft for retry', async () => {
  const fetch = mockApi({ '/analyze': async () => ({ ok: false, json: async () => ({ detail: 'Repository not found' }) }) });
  const { result } = renderHook(() => useChat());
  act(() => { result.current.setRepoUrl('https://github.com/acme/missing'); result.current.setDraft('Help'); });
  await act(async () => result.current.sendMessage(event()));
  expect(result.current.repoError).toBe('Repository not found');
  expect(result.current.draft).toBe('Help');
  expect(result.current.isSending).toBe(false);
  expect(fetch.mock.calls.some(([url]) => url === '/build')).toBe(false);
});

test('scanning locks out duplicate submissions', async () => {
  let finish;
  const fetch = mockApi({ '/analyze': () => new Promise((resolve) => { finish = resolve; }) });
  const { result } = renderHook(() => useChat());
  act(() => result.current.setRepoUrl('https://github.com/acme/ui'));
  let pending;
  act(() => { pending = result.current.analyzeRepository(event()); });
  await waitFor(() => expect(result.current.status).toBe('scanning'));
  expect(result.current.isAnalyzing).toBe(true);
  await act(async () => result.current.analyzeRepository(event()));
  expect(fetch.mock.calls.filter(([url]) => url === '/analyze')).toHaveLength(1);
  await act(async () => { finish(ok({ session_id: 'new', files_analyzed: 4, context })); await pending; });
  expect(result.current.isAnalyzing).toBe(false);
});

test('switching repository clears old conversation and creates a fresh session', async () => {
  const fetch = mockApi();
  const { result } = renderHook(() => useChat());
  act(() => result.current.setDraft('General question'));
  await act(async () => result.current.sendMessage(event()));
  act(() => result.current.setRepoUrl('https://github.com/acme/other'));
  await act(async () => result.current.analyzeRepository(event()));
  expect(result.current.messages).toEqual([]);
  const analyzeCall = fetch.mock.calls.find(([url]) => url === '/analyze');
  expect(JSON.parse(analyzeCall[1].body)).toEqual({ repo_url: 'https://github.com/acme/other' });
});


test('failed generation restores the draft without leaving a duplicate user message', async () => {
  mockApi({ '/build': async () => ({ ok: false, json: async () => ({ detail: 'Please retry' }) }) });
  const { result } = renderHook(() => useChat());
  act(() => result.current.setDraft('Add a card'));
  await act(async () => result.current.sendMessage(event()));
  expect(result.current.error).toBe('Please retry');
  expect(result.current.draft).toBe('Add a card');
  expect(result.current.messages).toEqual([]);
});
