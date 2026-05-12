import { Button } from '#/components/ui/button'

interface ErrorFallbackProps {
  error: Error
  reset?: () => void
}

export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <div className="page-wrap flex flex-col items-center justify-center gap-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-destructive">Something went wrong!</h1>
      <p className="max-w-md text-muted-foreground">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      {reset && (
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
      )}
    </div>
  )
}