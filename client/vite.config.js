import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: resolve(__dirname), 
  plugins: [react(),tailwindcss()],
  build: {
    outDir: resolve(__dirname, 'dist'),
  },
})