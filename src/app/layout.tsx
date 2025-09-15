import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gliter - Encuentra tu match perfecto',
  description: 'App de dating con geolocalización para encontrar personas cerca de ti',
  metadataBase: new URL('https://gliter.com.ar'),
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-primary-50 min-h-screen`}>
        <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700">
          <Header />
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}