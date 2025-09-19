import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import { AuthProvider } from '@/contexts/AuthContext'
import Script from 'next/script'

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
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-primary-50 min-h-screen`}>
        <Script id="prevent-extension-conflicts" strategy="beforeInteractive">{`
          (function(){
            try {
              // Prevenir errores de redefinición de ethereum (bybit, MetaMask, etc.)
              window.addEventListener('error', function(event){
                if (event && event.message && (
                  event.message.includes('Cannot redefine property: ethereum') ||
                  event.message.includes('evmAsk') ||
                  event.message.includes('bybit')
                )) {
                  console.warn('[Gliter] Extension conflict handled:', event.message);
                  event.preventDefault();
                  event.stopPropagation();
                  return false;
                }
              }, true);
              
              // Suprimir errores de consola relacionados con extensiones
              var origError = console.error;
              console.error = function(){
                try {
                  var msg = Array.prototype.join.call(arguments, ' ');
                  if (msg.includes('evmAsk') || 
                      msg.includes('Cannot redefine property: ethereum') ||
                      msg.includes('bybit:page provider inject')) {
                    console.warn('[Gliter] Extension error suppressed:', msg);
                    return;
                  }
                } catch(e) {}
                return origError.apply(console, arguments);
              };
              
              // Manejar promesas rechazadas de extensiones
              window.addEventListener('unhandledrejection', function(event){
                try {
                  var msg = String(event.reason || '');
                  if (
                    msg.includes('Cannot redefine property: ethereum') ||
                    msg.includes('MetaMask') ||
                    msg.includes('ethereum') ||
                    msg.includes('evmAsk') ||
                    msg.includes('bybit')
                  ) {
                    console.warn('[Gliter] Extension rejection handled:', msg);
                    event.preventDefault();
                    return false;
                  }
                } catch(e) {}
              }, { capture: true });
              
              // Proteger window.ethereum de redefiniciones
              if (typeof window.ethereum !== 'undefined') {
                try {
                  Object.defineProperty(window, 'ethereum', {
                    value: window.ethereum,
                    writable: false,
                    configurable: false
                  });
                } catch(e) {
                  // Ya está definido, ignorar
                }
              }
            } catch(e) {
              console.warn('[Gliter] Extension conflict prevention setup failed:', e);
            }
          })();
        `}</Script>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700">
            <Header />
            <main className="container mx-auto px-4 py-6">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}