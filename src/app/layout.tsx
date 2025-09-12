import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gliter - Encuentra tu match perfecto',
  description: 'App de dating con geolocalización para encontrar personas cerca de ti',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-primary-50 min-h-screen`}>
        <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700">
          {children}
        </div>
      </body>
    </html>
  );
}