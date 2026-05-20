import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"], 
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ExamPro - Online Examination Platform',
  description: 'A comprehensive online examination platform with AI-powered feedback and analytics',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#0d9488',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} bg-background`} data-scroll-behavior="smooth">
      <body className="font-sans antialiased min-h-screen">
        {children}
        <Toaster 
          position="top-right" 
          richColors 
          toastOptions={{
            style: {
              borderRadius: '0.75rem',
            },
          }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
