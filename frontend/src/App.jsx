import { useEffect, useRef, useState } from 'react'
import { ArrowDown, RefreshCw } from 'lucide-react'
import { askAssistant } from './api/chatbot'
import { ChatMessage } from './components/ChatMessage'
import { EmptyState } from './components/EmptyState'
import { Header } from './components/Header'
import { LoadingIndicator } from './components/LoadingIndicator'
import { MessageInput } from './components/MessageInput'

const STORAGE_KEY = 'technova-rag-chat'
const THEME_KEY = 'technova-rag-theme'
const MAX_HISTORY_ITEMS = 24
const MAX_INPUT_LENGTH = 2000

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

const readSavedMessages = () => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return []

    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []

    return parsed.slice(-MAX_HISTORY_ITEMS)
  } catch {
    return []
  }
}

const normalizeTheme = (theme) => (theme === 'light' ? 'light' : 'dark')

function App() {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = window.localStorage.getItem(THEME_KEY)
      return normalizeTheme(savedTheme)
    } catch {
      return 'dark'
    }
  })
  const [messages, setMessages] = useState(() => readSavedMessages())
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('connected')
  const [lastFailedQuestion, setLastFailedQuestion] = useState('')
  const [showScrollButton, setShowScrollButton] = useState(false)

  const chatContainerRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    if (!messages.length) {
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }

    const compactMessages = messages.slice(-MAX_HISTORY_ITEMS)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(compactMessages))
  }, [messages])

  useEffect(() => {
    if (!chatContainerRef.current) return

    const container = chatContainerRef.current
    container.scrollTop = container.scrollHeight
    setShowScrollButton(false)
  }, [messages, isLoading])

  const scrollToBottom = () => {
    if (!chatContainerRef.current) return
    chatContainerRef.current.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }

  const handleScroll = () => {
    const container = chatContainerRef.current
    if (!container || !messages.length) {
      setShowScrollButton(false)
      return
    }

    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120
    setShowScrollButton(!nearBottom)
  }

  const submitQuestion = async (question) => {
    const trimmed = question.trim()

    if (!trimmed || isLoading) {
      return
    }

    setIsLoading(true)
    setStatus('connecting')
    setLastFailedQuestion('')
    setInput('')

    const userMessage = {
      id: makeId(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    }

    const assistantId = makeId()
    const assistantMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isPending: true,
      timestamp: new Date().toISOString(),
      originalQuestion: trimmed,
    }

    setMessages((current) => [...current, userMessage, assistantMessage])

    try {
      const { answer } = await askAssistant(trimmed)
      setStatus('connected')
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: answer,
                isPending: false,
                isError: false,
                originalQuestion: trimmed,
              }
            : message,
        ),
      )
    } catch (error) {
      const message = error.message || 'Unable to connect to the AI server. Please try again.'
      setStatus('offline')
      setLastFailedQuestion(trimmed)
      setMessages((current) =>
        current.map((item) =>
          item.id === assistantId
            ? {
                ...item,
                content: message,
                isPending: false,
                isError: true,
                originalQuestion: trimmed,
              }
            : item,
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  const retryLastQuestion = () => {
    if (!lastFailedQuestion || isLoading) {
      return
    }

    submitQuestion(lastFailedQuestion)
  }

  const clearConversation = () => {
    setMessages([])
    setInput('')
    setLastFailedQuestion('')
    setStatus('connected')
  }

  const statusLabel = status === 'offline' ? 'offline' : status === 'connecting' ? 'connecting' : 'online'

  return (
    <div className="app-shell">
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        onNewChat={() => setMessages([])}
        statusLabel={statusLabel}
      />

      <main className="chat-shell">
        <div className="chat-panel" ref={chatContainerRef} onScroll={handleScroll}>
          {messages.length === 0 && !isLoading ? (
            <EmptyState onSelectQuestion={submitQuestion} />
          ) : (
            <div className="message-list">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onRetry={message.isError ? retryLastQuestion : undefined}
                />
              ))}

              {isLoading ? <LoadingIndicator /> : null}
            </div>
          )}
        </div>

        {showScrollButton ? (
          <button type="button" className="scroll-button" onClick={scrollToBottom} aria-label="Scroll to newest message">
            <ArrowDown size={18} />
          </button>
        ) : null}

        <MessageInput
          value={input}
          onChange={setInput}
          onSubmit={() => submitQuestion(input)}
          disabled={isLoading}
          maxLength={MAX_INPUT_LENGTH}
          onClear={clearConversation}
          hasConversation={messages.length > 0}
        />

        {lastFailedQuestion ? (
          <div className="inline-error-banner" role="alert">
            <span>{lastFailedQuestion}</span>
            <button type="button" className="retry-banner-button" onClick={retryLastQuestion}>
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        ) : null}
      </main>
    </div>
  )
}

export default App
