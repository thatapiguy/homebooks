import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppNav } from '@/components/AppNav'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'HomeBooks',
  description: 'Your personal home book library',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HomeBooks',
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#6366f1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-dvh flex-col md:flex-row">
          <AppNav />
          <main className="flex-1 overflow-auto pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
            {children}
          </main>
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
