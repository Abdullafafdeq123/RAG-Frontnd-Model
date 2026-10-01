const DEFAULT_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 30000)

const normalizeBaseUrl = () => {
  const value = (import.meta.env.VITE_API_BASE_URL || '').trim()

  if (!value) {
    throw new Error(
      'VITE_API_BASE_URL is not configured. Set it to your FastAPI backend URL in Vercel or local .env, e.g. https://your-api.example.com',
    )
  }

  return value.replace(/\/$/, '')
}

const readErrorText = async (response) => {
  try {
    const payload = await response.clone().json()
    if (typeof payload?.detail === 'string') return payload.detail
    if (typeof payload?.detail === 'object') {
      const message = payload.detail?.msg || payload.detail?.error || JSON.stringify(payload.detail)
      if (message) return message
    }
    if (payload && typeof payload === 'object') {
      return JSON.stringify(payload)
    }
  } catch {
    // fall through to text parsing below
  }

  try {
    const text = await response.text()
    if (text) return text
  } catch {
    // no-op
  }

  return 'Unexpected server response.'
}

const mapError = (error) => {
  if (error?.name === 'AbortError') {
    return 'The request took too long. Please try again.'
  }

  if (error?.message) {
    return error.message
  }

  return 'The AI service encountered a problem. Please try again.'
}

export async function askAssistant(question) {
  const trimmedQuestion = String(question || '').trim()

  if (!trimmedQuestion) {
    throw new Error('Please enter a question before sending.')
  }

  const baseUrl = normalizeBaseUrl().replace(/\/$/, '')
  const url = `${baseUrl}/ask`
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ question: trimmedQuestion }),
      signal: controller.signal,
      credentials: 'same-origin',
    })

    if (!response.ok) {
      const detail = await readErrorText(response)
      if (response.status >= 500) {
        throw new Error('The AI service encountered a problem. Please try again.')
      }

      if (response.status === 400) {
        throw new Error('Please provide a valid question and try again.')
      }

      throw new Error(detail || 'Unable to connect to the AI server. Please try again.')
    }

    const payload = await response.json()

    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid response from the server.')
    }

    const answer = typeof payload.answer === 'string' ? payload.answer.trim() : ''

    if (!answer) {
      throw new Error('The AI response was empty. Please try again.')
    }

    return { answer }
  } catch (error) {
    throw new Error(mapError(error))
  } finally {
    window.clearTimeout(timeoutId)
  }
}
