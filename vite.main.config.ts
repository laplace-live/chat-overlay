import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      formats: ['es'],
      entry: './src/main.ts',
      fileName: 'main',
    },
    rollupOptions: {
      // Mark optional ws dependencies as external (they're not required)
      external: ['bufferutil', 'utf-8-validate'],
    },
  },
})
