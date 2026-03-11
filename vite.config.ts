import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/Draw-Steel-Character-Creator/',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          /* Vendor: React ecosystem + state management */
          'vendor': [
            'react',
            'react-dom',
            'zustand',
          ],
          /* PDF generation — only loaded on export */
          'pdf-lib': ['pdf-lib'],
          /* Large data files — cacheable separately */
          'game-data': [
            './src/data/class-features.json',
            './src/data/abilities.json',
            './src/data/treasures.json',
            './src/data/titles.json',
            './src/data/complications.json',
            './src/data/kits.json',
            './src/data/ancestries.json',
          ],
        },
      },
    },
  },
})
