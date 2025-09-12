import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    // Define global constants for environment variables
    define: {
      __APP_ENV__: JSON.stringify(env.NODE_ENV || mode),
      __VITE_ENVIRONMENT__: JSON.stringify(env.VITE_ENVIRONMENT || mode)
    },
    
    css: {
      devSourcemap: true
    },
    
    server: {
      hmr: {
        overlay: false
      },
      // Configure CORS for development
      cors: true
    },
    
    build: {
      // Generate source maps for production debugging
      sourcemap: mode === 'production' ? 'hidden' : true,
      
      // Optimize build for production
      minify: false,
      
      rollupOptions: {
        input: {
        main: resolve(__dirname, 'index.html'),
        auth: resolve(__dirname, 'auth.html')
      },
        external: ['firebase-admin'],
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage']
          },
          // Optimize chunk size and naming
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '') : 'chunk';
            return `assets/${facadeModuleId}-[hash].js`;
          },
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        },
        
        // Tree shaking configuration
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          unknownGlobalSideEffects: false
        }
      },
      
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 800,
      
      // Enable compression
      reportCompressedSize: true,
      
      // Optimize for production
      cssCodeSplit: true,
      
      // Advanced minification options already configured above
      
      // Set build target for better browser compatibility
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']
    },
    
    // Environment-specific optimizations
    optimizeDeps: {
      include: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage']
    }
  }
})