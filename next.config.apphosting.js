/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Firebase App Hosting (SSR/SSG)
  // NO usar 'export' - App Hosting necesita servidor Next.js
  output: 'standalone',
  trailingSlash: false,
  skipTrailingSlashRedirect: false,
  
  // ESLint: permitir builds aunque existan errores de lint (temporal)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Image optimization para App Hosting
  images: {
    domains: ['firebasestorage.googleapis.com', 'images.unsplash.com'],
    // App Hosting soporta optimización de imágenes
    unoptimized: false
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'Gliter',
    NEXT_PUBLIC_APP_VERSION: '1.0.0'
  },
  
  // Security headers para App Hosting
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      // Cache para assets estáticos
      {
        source: '/icon.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Redirects para App Hosting
  async redirects() {
    return [
      {
        source: '/auth.html',
        destination: '/auth',
        permanent: true,
      },
    ];
  },
  
  // Experimental features para App Hosting
  experimental: {
    // Optimizaciones para App Hosting
    serverComponentsExternalPackages: ['firebase-admin'],
  },
};

module.exports = nextConfig;