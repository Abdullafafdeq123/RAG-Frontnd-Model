import { useState } from 'react'
import { Check, Clipboard, LoaderCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

const markdownComponents = {
  a: ({ href, children, ...props }) => (
    <a href={href} target="_blank" rel="noreferrer" {...props}>
      {children}
    </a>
  ),
  table: ({ children, ...props }) => (
    <div className="table-wrap">
      <table {...props}>{children}</table>
    </div>
  ),
  code: ({ inline, className, children, ...props }) => {
    if (inline) {
      return <code className="inline-code" {...props}>{children}</code>
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
}

export function ChatMessage({ message, onRetry }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isError = message.isError

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      // no-op; clipboard is optional
    }
  }

  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      <div className={`chat-message ${isUser ? 'user' : 'assistant'} ${isError ? 'error' : ''}`}>
        {message.isPending ? (
          <div className="pending-message">
            <LoaderCircle className="spinner" size={16} />
            <span>Thinking...</span>
          </div>
        ) : (
          <>
            <div className="message-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
                components={markdownComponents}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {!isUser ? (
              <div className="message-toolbar">
                <button type="button" className="copy-button" onClick={handleCopy} aria-label="Copy response">
                  {copied ? <Check size={14} /> : <Clipboard size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>

                {isError && onRetry ? (
                  <button type="button" className="retry-button" onClick={onRetry}>
                    Retry
                  </button>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
