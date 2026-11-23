import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  base: '/enterprise-member-system/',
  plugins: [vue()],
  test: {
    environment: 'jsdom'
  }
})