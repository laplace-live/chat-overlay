import { defineConfig } from 'vite'

// https://github.com/tailwindlabs/tailwindcss/discussions/16250
import tailwindcss from './node_modules/@tailwindcss/vite/dist/index.mjs'

// https://vitejs.dev/config
export default defineConfig({
  plugins: [tailwindcss()],
})
