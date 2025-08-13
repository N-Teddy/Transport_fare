import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: {},
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  resolve: {
    alias: {
      // This tells Vite to use the browser-compatible version of the 'crypto' module
      'crypto': 'crypto-browserify',
      // This is also needed for the crypto-browserify library to work
      'stream': 'stream-browserify'
    }
  }
})
