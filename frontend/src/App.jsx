import { ArrowRight, Bot } from 'lucide-react';
import CircuitPattern from './components/CircuitPattern.jsx';
import ProcessDiagram from './components/ProcessDiagram.jsx';
import Reveal from './components/Reveal.jsx';
import './styles/landing.css';

function HeroSection() {
  return (
    <section className="hero" id="home">
      <CircuitPattern />

      <Reveal className="hero-content">
        <span className="hero-bot">
          <Bot size={17} />
        </span>
        <h1>SALVAL</h1>
        <p className="hero-headline">
          Understand your code. Build with confidence.
        </p>
        <p className="hero-description">
          An AI development assistant that analyzes your codebase before it
          helps you continue building.
        </p>
        <a className="hero-cta" href="#chat">
          MEET SALVAL <ArrowRight size={14} />
        </a>
      </Reveal>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="about" id="about">
      <Reveal className="about-content">
        <span className="section-bot">
          <Bot size={31} />
        </span>
        <h2 className="section-title">WHAT IS SALVAL?</h2>
        <p className="about-copy section-copy">
          SALVAL is an AI-powered development companion designed to understand
          your codebase before helping you change it.
          <br />
          It analyzes your project’s architecture, logic, dependencies, and
          patterns to build meaningful context. Then, it coordinates specialized
          AI agents to help you understand, decide, implement, review, and
          continue development with greater confidence.
        </p>
      </Reveal>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="process" id="process">
      <Reveal className="process-heading">
        <h2 className="section-title">From code to your next move.</h2>
        <p>
          First, SALVAL understands what you have. Then it helps you decide what
          comes next.
        </p>
      </Reveal>
      <ProcessDiagram />
    </section>
  );
}

function ClosingSection() {
  return (
    <section className="closing">
      <Reveal className="closing-content">
        <span className="section-bot">
          <Bot size={31} />
        </span>
        <h2 className="section-title">SEE SALVAL IN ACTION!</h2>
        <p className="closing-copy section-copy">
          Experience how SALVAL understands your codebase, coordinates
          specialized AI agents, and helps you move development forward with
          context.
        </p>
        <a className="demo-link" href="#chat">
          TRY THE DEMO <ArrowRight size={14} />
        </a>
      </Reveal>
    </section>
  );
}

function App() {
  return (
    <>
      <main>
        <HeroSection />
        <AboutSection />
        <ProcessSection />
        <ClosingSection />
      </main>

      <a
        className="floating-bot"
        href="#chat"
        aria-label="Open SALVAL chat"
      >
        <Bot size={21} />
      </a>
    </>
  );
}

export default App;
