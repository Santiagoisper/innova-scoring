import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'

export const metadata: Metadata = {
  title: 'Site Scoring | Innova Trials',
  description: 'Clinical Research Site Evaluation Platform',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
