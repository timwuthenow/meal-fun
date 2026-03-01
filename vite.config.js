import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This allows access from your local network
    port: 3000,
    proxy: {
      // Proxy API requests to avoid CORS during development
      '/api': {
        target: 'https://dev.aletyx.solutions',
        changeOrigin: true,
        secure: false,
      }
    }
  },
})
