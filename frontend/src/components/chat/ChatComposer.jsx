import { ArrowUp } from 'lucide-react';

export default function ChatComposer({
  value,
  isSending,
  onChange,
  onSubmit,
  status,
}) {
  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (value.trim() && !isSending) {
        onSubmit(event);
      }
    }
  }

  return (
    <>
      <form className="composer" onSubmit={onSubmit}>
        <textarea
          aria-label="Message SALVAL"
          disabled={isSending}
          maxLength={1000}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message SALVAL..."
          rows={2}
          value={value}
        />
        <div className="composer-bottom">
          <span aria-live="polite">
            {status === 'waking'
              ? '⏳ Waking up the server, hang tight…'
              : isSending
              ? 'Routing to an agent…'
              : 'Project context · demo'}
          </span>
          <button
            type="submit"
            disabled={!value.trim() || isSending}
            aria-label="Send message"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </form>
      <p className="composer-footnote">
        A little more context. A lot less explaining.
      </p>
    </>
  );
}
