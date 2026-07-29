import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 500,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // Production asset file naming for long-term caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router-dom/') || id.includes('scheduler/')) {
              return 'vendor-react';
            }
            // TanStack Query
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            // Framer Motion (largest dep — isolated for best caching)
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            // SweetAlert2
            if (id.includes('sweetalert2')) {
              return 'vendor-swal';
            }
            // React Icons
            if (id.includes('react-icons')) {
              return 'vendor-icons';
            }
            // All other third-party libraries
            return 'vendor-libs';
          }
        },
      },
    },
  },
  // Optimize deps for faster dev server cold starts
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'clsx',
      'framer-motion',
    ],
  },
})
