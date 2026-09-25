import { AGENTS } from '../../data/chat.js';

export default function AgentList({ activeAgent }) {
  return (
    <section className="agent-section" aria-label="SALVAL agents">
      <h2 className="agent-section-heading">AGENTS</h2>
      <ul className="agent-list">
        {AGENTS.map((agent) => {
          const isActive = agent.name === activeAgent;

          return (
            <li
              className={`agent-list-item${isActive ? ' is-active' : ''}`}
              key={agent.id}
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
