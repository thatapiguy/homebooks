'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, ScanLine, MapPin, Tag, Plus, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/library', label: 'Library', icon: BookOpen },
  { href: '/scan', label: 'Scan', icon: ScanLine },
  { href: '/authors', label: 'Authors', icon: User },
  { href: '/locations', label: 'Locations', icon: MapPin },
  { href: '/tags', label: 'Tags', icon: Tag },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-56 md:border-r md:bg-card md:min-h-screen md:p-4">
        <div className="mb-8">
          <Link href="/library" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">homebooks</span>
          </Link>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <Link
          href="/books/new"
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Book
        </Link>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between border-b bg-card px-4 py-3">
        <Link href="/library" className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold">homebooks</span>
        </Link>
        <Link
          href="/books/new"
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Add
        </Link>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t bg-card pb-[env(safe-area-inset-bottom)]">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
              pathname.startsWith(href)
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  )
}
