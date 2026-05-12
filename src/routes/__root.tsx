import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { Toaster } from '#/components/ui/sonner'
import { TooltipProvider } from '#/components/ui/tooltip'
import { Layout } from '#/components/Layout'
import { ErrorFallback } from '#/components/ErrorFallback'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootDocument,
  errorComponent: ({ error, reset }) => (
    <ErrorFallback error={error} reset={reset} />
  ),
})

function RootDocument() {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        <TooltipProvider>
          <Layout />
          <Outlet />
          <Toaster position="top-right" richColors closeButton />
          <Scripts />
        </TooltipProvider>
      </body>
    </html>
  )
}