import { API_BASE } from './constants'
import { buildUrl } from './build-url'
import { parseApiProblem } from './api-error'

export async function travelRequest<T = unknown>(options: {
  path: string
  method?: string
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
}): Promise<T> {
  const url = buildUrl(API_BASE + options.path, options.query)

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`
    try {
      const responseBody = await response.json()
      const problem = parseApiProblem(responseBody)
      if (problem?.message) {
        errorMessage = problem.message
      } else if (problem?.error) {
        errorMessage = problem.error
      }
    } catch {
      // не JSON – оставляем стандартное сообщение
    }
    throw new Error(errorMessage)
  }

  if (response.status === 204) {
    return undefined as unknown as T
  }

  return response.json()
}