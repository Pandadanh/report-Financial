import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/report-Financial/',
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      '.ngrok-free.app',
      'localhost',
      '127.0.0.1'
    ],
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
