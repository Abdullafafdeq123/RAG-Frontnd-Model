import { Bot, Moon, Plus, Sun } from 'lucide-react'

export function Header({ theme, onToggleTheme, onNewChat, statusLabel }) {
  const label =
    statusLabel === 'offline' ? 'Offline' : statusLabel === 'connecting' ? 'Connecting' : 'AI Online'

  return (
    <header className="app-header">
      <div className="brand-wrap" aria-label="Application title and connection status">
        <div className="brand-mark" aria-hidden="true">
          <Bot size={18} />
        </div>

        <div className="brand-copy">
          <div className="brand-name">TechNova AI</div>
          <div className="brand-subtitle">RAG Assistant</div>
        </div>
      </div>

      <div className="header-actions">
        <div className="status-pill" aria-live="polite">
          <span className={`status-dot ${statusLabel === 'offline' ? 'offline' : 'online'}`} />
          {label}
        </div>

        <button
          type="button"
          className="icon-button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button type="button" className="secondary-button" onClick={onNewChat}>
          <Plus size={16} />
          New chat
        </button>
      </div>
    </header>
  )
}
