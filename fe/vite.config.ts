import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: 'all',
    cors: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      },
    },
    hmr: {
      clientPort: 443
    }
  }
})
