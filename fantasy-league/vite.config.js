import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Permanent public site is GitHub Pages under /1122/ — assets & router
  // must respect that sub-path there, while local/backend serving stays at /.
  base: process.env.GITHUB_PAGES === 'true' ? '/1122/' : './',
  plugins: [react()],
  server: {
    host: true, // Listen on all local IPs
    allowedHosts: true, // Allow ALL hosts (Cloudflare, ngrok, localtunnel, Serveo, direct IP, etc.)
    proxy: {
      '/api': 'http://localhost:3000',
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-bundle';
            }
            if (id.includes('flv.js')) {
              return 'flv-bundle';
            }
            if (id.includes('lucide-react')) {
              return 'icons-bundle';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})
