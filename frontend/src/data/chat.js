export const AGENTS = [
  { id: 'main',      name: 'SALVAL',  role: 'Your AI dev team' },
  { id: 'architect', name: 'Aria',    role: 'Architecture & structure' },
  { id: 'code',      name: 'Leo',     role: 'Clean code & reviews' },
  { id: 'debug',     name: 'Salma',   role: 'Debugging & fixes' },
  { id: 'ui',        name: 'Valerie', role: 'UI/UX & front-end' },
];

export const STARTER_PROMPTS = [
  'I want to build a project, help me structure it cleanly',
  'Review my code and tell me what to improve',
  'I have a bug I cannot fix',
  'Help me improve my interface',
];

export function getAgent(agentId) {
  return AGENTS.find((agent) => agent.id === agentId) ?? AGENTS[0];
}

export function getConversationTitle(messages) {
  const firstMessage = messages.find((message) => message.role === 'user');

  if (!firstMessage) {
    return 'New conversation';
  }

  const title = firstMessage.content.trim();

  return title.length > 36 ? `${title.slice(0, 36).trimEnd()}…` : title;
}
