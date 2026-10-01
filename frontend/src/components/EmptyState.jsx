export function EmptyState({ onSelectQuestion }) {
  const exampleQuestions = [
    'What services does TechNova Solutions offer?',
    'What are the company working hours?',
    'How can I contact TechNova support?',
  ]

  return (
    <div className="empty-state" aria-live="polite">
      <div className="empty-icon">✦</div>
      <h2>How can I help you?</h2>
      <p>Ask a question about the knowledge base available to this assistant.</p>

      <div className="example-grid">
        {exampleQuestions.map((question) => (
          <button
            key={question}
            type="button"
            className="example-chip"
            onClick={() => onSelectQuestion(question)}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  )
}
