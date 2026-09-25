import { useEffect } from 'react';
import { ArrowRight, Bot } from 'lucide-react';
import CircuitPattern from './components/CircuitPattern.jsx';
import ProcessDiagram from './components/ProcessDiagram.jsx';
import './styles.css';

function useScrollReveal() {
  useEffect(() => {
    const revealElement = (element) => {
      element.classList.add('is-visible');
      observer.unobserve(element);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealElement(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);
}

function HeroSection() {
  return (
    <section className="hero" id="home">
      <CircuitPattern />

      <div className="hero-content reveal">
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
        <a className="hero-cta" href="/chat">
          MEET SALVAL <ArrowRight size={14} />
        </a>
      </div>

      
    </section>
  );
}

function AboutSection() {
  return (
    <section className="about" id="about">
      <div className="about-content reveal">
        <span className="section-bot">
          <Bot size={31} />
        </span>
        <h2>WHAT IS SALVAL?</h2>
        <p className="about-copy">
          SALVAL is an AI-powered development companion designed to understand
          your codebase before helping you change it.
          <br />
          It analyzes your project’s architecture, logic, dependencies, and
          patterns to build meaningful context. Then, it coordinates specialized
          AI agents to help you understand, decide, implement, review, and
          continue development with greater confidence.
        </p>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="process" id="process">
      <div className="process-heading reveal">
        <h2>From code to your next move.</h2>
        <p>
          First, SALVAL understands what you have. Then it helps you decide what
          comes next.
        </p>
      </div>
      <ProcessDiagram />
    </section>
  );
}

function ClosingSection() {
  return (
    <section className="closing">
      <div className="closing-content reveal">
        <span className="section-bot">
          <Bot size={31} />
        </span>
        <h2>SEE SALVAL IN ACTION!</h2>
        <p className="closing-copy">
          Experience how SALVAL understands your codebase, coordinates
          specialized AI agents, and helps you move development forward with
          context.
        </p>
        <a className="demo-link" href="/chat">
          TRY THE DEMO <ArrowRight size={14} />
        </a>
      </div>
    </section>
  );
}

function App() {
  useScrollReveal();

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
        href="/chat"
        aria-label="Open SALVAL chat"
      >
        <Bot size={21} />
      </a>
    </>
  );
}

export default App;
