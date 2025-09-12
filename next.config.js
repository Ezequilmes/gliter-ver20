/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Firebase Hosting
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Image optimization configuration
  images: {
    domains: ['firebasestorage.googleapis.com', 'images.unsplash.com'],
    unoptimized: true // Required for static export
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'Gliter',
    NEXT_PUBLIC_APP_VERSION: '1.0.0'
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(self), microphone=(), camera=()'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig