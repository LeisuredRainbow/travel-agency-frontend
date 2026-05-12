export function parseApiProblem(body: unknown): { message?: string; error?: string } | null {
  if (typeof body !== 'object' || body === null) return null

  const obj = body as Record<string, unknown>

  if (typeof obj.message === 'string') {
    return { message: obj.message }
  }

  if (typeof obj.error === 'string') {
    return { message: obj.error }
  }

  if (obj.validationErrors && typeof obj.validationErrors === 'object') {
    const details = Object.entries(obj.validationErrors as Record<string, string>)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join('; ')
    if (details) {
      return { message: details }
    }
  }

  return null
}