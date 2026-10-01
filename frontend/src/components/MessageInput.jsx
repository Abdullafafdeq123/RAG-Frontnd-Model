import { SendHorizonal, SquarePen } from 'lucide-react'

export function MessageInput({
  value,
  onChange,
  onSubmit,
  disabled,
  maxLength,
  onClear,
  hasConversation,
}) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="composer-wrap">
      <div className="composer-header">
        <span className="composer-label">Ask a question</span>
        {hasConversation ? (
          <button type="button" className="clear-button" onClick={onClear}>
            <SquarePen size={14} />
            Clear chat
          </button>
        ) : null}
      </div>

      <div className="composer">
        <textarea
          aria-label="Type your question"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about the knowledge base..."
          rows={1}
          maxLength={maxLength}
          disabled={disabled}
          className="message-input"
        />

        <div className="composer-footer">
          <span className="char-count">{value.length}/{maxLength}</span>

          <button
            type="button"
            className="send-button"
            onClick={onSubmit}
            disabled={disabled || !value.trim()}
            aria-label="Send message"
          >
            <SendHorizonal size={18} />
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
