import { Link, Outlet } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

const navigation = [
  { name: 'Tours', to: '/tours' },
  { name: 'Hotels', to: '/hotels' },
  { name: 'Guides', to: '/guides' },
  { name: 'Clients', to: '/clients' },
  { name: 'Bookings', to: '/bookings' },
]

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-(--line) bg-(--header-bg) px-4 backdrop-blur-lg">
        <nav className="page-wrap flex items-center gap-3 py-3">
          <Link
            to="/tours"
            className="text-lg font-bold text-primary truncate max-w-[150px] sm:max-w-none"
          >
            TRAVEL AGENCY
          </Link>
          <ul className="flex list-none gap-1">
            {navigation.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="inline-flex h-9 items-center rounded-full border border-transparent px-3 text-sm font-semibold text-muted-foreground transition hover:text-(--ink) hover:border-(--chip-line) hover:bg-(--link-bg-hover)"
                  activeProps={{ className: '!text-(--ink) !border-(--chip-line) !bg-(--link-bg-hover)' }}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
            <ThemeToggle />
          </div>
        </nav>
      </header>
      <main className="page-wrap px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}