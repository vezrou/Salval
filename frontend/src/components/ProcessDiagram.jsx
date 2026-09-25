import Reveal from './Reveal.jsx';
import '../styles/process-diagram.css';

const DIAGRAM_COLUMNS = [
  {
    title: 'Understand the codebase',
    steps: [
      { label: 'Codebase' },
      {
        items: ['Architecture', 'Logic', 'Dependencies', 'Patterns'],
      },
      { label: 'Project Understanding', emphasis: true },
      { label: 'Developer Guidance' },
    ],
  },
  {
    title: 'Build with the right agents',
    steps: [
      { label: 'Project Understanding' },
      { label: 'Main Agent', emphasis: true },
      {
        items: ['API Agent', 'Logic Agent', 'Data Agent', 'Review Agent'],
      },
      { label: 'Next Development Step' },
    ],
  },
];

function Stage({ label, emphasis }) {
  const className = emphasis ? 'simple-stage stage-emphasis' : 'simple-stage';

  return <div className={className}>{label}</div>;
}

function Step({ step, isLast }) {
  return (
    <>
      {step.items ? (
        <div className="topic-list">
          {step.items.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      ) : (
        <Stage label={step.label} emphasis={step.emphasis} />
      )}
      {!isLast && <span className="simple-arrow" aria-hidden="true" />}
    </>
  );
}

function DiagramColumn({ title, steps }) {
  return (
    <article className="diagram-column">
      <h3 className="diagram-heading">{title}</h3>
      <div className="simple-flow">
        {steps.map((step, index) => (
          <Step
            key={step.label ?? step.items.join('-')}
            step={step}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    </article>
  );
}

export default function ProcessDiagram() {
  return (
    <Reveal className="simple-diagram">
      {DIAGRAM_COLUMNS.map((column) => (
        <DiagramColumn key={column.title} {...column} />
      ))}
    </Reveal>
  );
}
