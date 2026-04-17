import type { Metadata } from 'next'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Church Check-in System',
  description: 'Check-in system for church music presentation events',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b border-gray-200 bg-white shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold text-gray-900">
              Church Check-in
            </Link>
            <nav className="flex items-center gap-3">
              <Link href="/checkin" className="rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
                Check-in
              </Link>
              <Link href="/admin" className="rounded bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600">
                Admin Dashboard
              </Link>
            </nav>
          </div>
        </header>
        <main className="min-h-screen bg-slate-50">{children}</main>
      </body>
    </html>
  )
}
