export const AGENTS = [
  { id: 'main', name: 'SALVAL', role: 'Main Agent' },
  { id: 'debug', name: 'Salma', role: 'Debugger Agent' },
  { id: 'ui', name: 'Valerie', role: 'UI/UX Agent' },
  { id: 'code', name: 'Leo', role: 'Code Agent' },
  { id: 'architect', name: 'Aria', role: 'Architect Agent' },
];

export const STARTER_PROMPTS = [
  'Help me structure a new project',
  'Help me understand this project',
  'I am stuck on an error',
  'Take a look at this interface',
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
