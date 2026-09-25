import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ darkMode, onToggle }) {
  const label = darkMode ? 'Switch to light mode' : 'Switch to dark mode';
  const Icon = darkMode ? Sun : Moon;

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
    >
      <Icon size={16} />
    </button>
  );
}
