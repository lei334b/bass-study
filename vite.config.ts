import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: false,
    fs: {
      strict: true,
      allow: [path.resolve(__dirname)]
    }
  }
})
