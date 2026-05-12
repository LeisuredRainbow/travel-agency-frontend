export function buildUrl(
  base: string,
  query?: Record<string, string | number | boolean | undefined>,
): string {
  const url = new URL(base)
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return url.toString()
}