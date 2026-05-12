import { createRouter, createRootRouteWithContext, createRoute } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { Layout } from './components/Layout'
import { ToursPage } from './routes/tours'
import { HotelsPage } from './routes/hotels'
import { GuidesPage } from './routes/guides'
import { ClientsPage } from './routes/clients'
import { BookingsPage } from './routes/bookings'
import { TooltipProvider } from '#/components/ui/tooltip'
import { Toaster } from '#/components/ui/sonner'

interface MyRouterContext {
  queryClient: QueryClient
}

const queryClient = new QueryClient()

const rootRoute = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <TooltipProvider>
      <Layout />
      <Toaster position="top-right" richColors closeButton />
    </TooltipProvider>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <ToursPage />,
})

const toursRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tours',
  component: ToursPage,
})

const hotelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hotels',
  component: HotelsPage,
})

const guidesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/guides',
  component: GuidesPage,
})

const clientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clients',
  component: ClientsPage,
})

const bookingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bookings',
  component: BookingsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  toursRoute,
  hotelsRoute,
  guidesRoute,
  clientsRoute,
  bookingsRoute,
])

export const router = createRouter({
  routeTree,
  context: { queryClient },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}