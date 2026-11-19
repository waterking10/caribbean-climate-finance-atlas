import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          cytoscape: ['cytoscape'],
          'capital-pathways': ['./src/data/capital-pathways.json'],
          evidence: ['./src/data/sources.json', './src/data/scope-sources.json'],
        },
      },
    },
  },
})
