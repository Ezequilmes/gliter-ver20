/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Firebase Hosting
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  // Optimización de imágenes para Firebase Hosting
  images: {
    unoptimized: true,
    domains: [
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
      'gliter.com.ar',
      'www.gliter.com.ar'
    ],
  },
  
  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  
  // Encabezados de seguridad básicos
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
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://www.recaptcha.net; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com wss://*.firebaseio.com https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://firebaseinstallations.googleapis.com https://firebaseremoteconfig.googleapis.com https://content-firebaseappcheck.googleapis.com https://www.google.com/recaptcha/; frame-src 'self' https://www.google.com https://www.recaptcha.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; object-src 'none'; base-uri 'self';"
          },
        ],
      },
    ];
  },
  
  // Redirects básicos
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Configuración experimental para App Hosting
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },

  // Configuración webpack para resolver problemas de hidratación
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;