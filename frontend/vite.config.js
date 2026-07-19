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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group react core dependencies
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router-dom/')) {
              return 'vendor-react';
            }
            // Tanstack react-query
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            // Framer motion
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            // Sweetalert2
            if (id.includes('sweetalert2')) {
              return 'vendor-swal';
            }
            // React icons
            if (id.includes('react-icons')) {
              return 'vendor-icons';
            }
            // Other libraries
            return 'vendor-libs';
          }
        },
      },
    },
  },
})
