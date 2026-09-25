const CODEBASE_TOPICS = [
  'Architecture',
  'Logic',
  'Dependencies',
  'Patterns',
];

const SPECIALIST_AGENTS = [
  'API Agent',
  'Logic Agent',
  'Data Agent',
  'Review Agent',
];

function Arrow() {
  return <span className="simple-arrow" aria-hidden="true" />;
}

function Stage({ children, emphasis = false }) {
  const classNames = emphasis
    ? 'simple-stage stage-emphasis'
    : 'simple-stage';

  return <div className={classNames}>{children}</div>;
}

function TopicList({ items }) {
  return (
    <div className="topic-list">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

function DiagramColumn({ title, children, className }) {
  return (
    <article className={`diagram-column ${className}`}>
      <header className="diagram-heading">
        <h3>{title}</h3>
      </header>
      <div className="simple-flow">{children}</div>
    </article>
  );
}

function CodebaseColumn() {
  return (
    <DiagramColumn
      title="Understand the codebase"
      className="understand-column"
    >
      <Stage>Codebase</Stage>
      <Arrow />
      <TopicList items={CODEBASE_TOPICS} />
      <Arrow />
      <Stage emphasis>Project Understanding</Stage>
      <Arrow />
      <Stage>Developer Guidance</Stage>
    </DiagramColumn>
  );
}

function AgentsColumn() {
  return (
    <DiagramColumn
      title="Build with the right agents"
      className="agents-column"
    >
      <Stage>Project Understanding</Stage>
      <Arrow />
      <Stage emphasis>Main Agent</Stage>
      <Arrow />
      <TopicList items={SPECIALIST_AGENTS} />
      <Arrow />
      <Stage>Next Development Step</Stage>
    </DiagramColumn>
  );
}

export default function ProcessDiagram() {
  return (
    <div className="simple-diagram reveal">
      <CodebaseColumn />
      <AgentsColumn />
    </div>
  );
}
