import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':  ['react', 'react-dom', 'react-router-dom'],
          'vendor-redux':  ['@reduxjs/toolkit', 'react-redux'],
          'vendor-motion': ['framer-motion'],
          'vendor-mui':    ['@mui/material', '@emotion/react', '@emotion/styled'],
          'vendor-charts': ['apexcharts', 'react-apexcharts', 'recharts'],
          'vendor-misc':   ['react-hot-toast', 'react-helmet-async', 'react-i18next', 'i18next'],
        },
      },
    },
  },
})
