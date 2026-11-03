import { defineConfig, devices } from '@playwright/test'

const base = process.env.VITE_BASE ?? '/PHB-Wet-en-Regelgeving/'

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  use: { baseURL: `http://localhost:4173${base}`, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobiel', use: { ...devices['Pixel 7'] } },
  ],
  webServer: { command: 'npx vite preview --outDir docs --port 4173 --strictPort', port: 4173, reuseExistingServer: true },
})
