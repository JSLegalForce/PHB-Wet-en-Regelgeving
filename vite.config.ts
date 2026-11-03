/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Base path voor GitHub Pages: https://jslegalforce.github.io/<repo>/
// Pas VITE_BASE aan als de repository een andere naam krijgt.
const base = process.env.VITE_BASE ?? '/PHB-Wet-en-Regelgeving/'

export default defineConfig({
  base,
  build: { outDir: 'docs', emptyOutDir: true },
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
