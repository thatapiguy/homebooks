import type { Metadata } from 'next'
import './globals.css'
import { AppNav } from '@/components/AppNav'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'homebooks',
  description: 'Your personal home book library',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen flex-col md:flex-row">
          <AppNav />
          <main className="flex-1 overflow-auto pb-16 md:pb-0">
            {children}
          </main>
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
