import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config
export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      formats: ['cjs'],
      entry: './src/preload.ts',
      fileName: 'preload',
    },
  },
  esbuild: {
    // Strip console.log and debugger statements in production
    drop: mode === 'production' ? ['debugger'] : [],
    pure: mode === 'production' ? ['console.log'] : [],
  },
}))
