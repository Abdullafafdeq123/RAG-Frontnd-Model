export function LoadingIndicator() {
  return (
    <div className="loading-indicator" aria-live="polite" aria-label="AI is thinking">
      <span className="pulse-dot" />
      <span className="pulse-dot" />
      <span className="pulse-dot" />
      <span className="loading-text">Thinking</span>
    </div>
  )
}
