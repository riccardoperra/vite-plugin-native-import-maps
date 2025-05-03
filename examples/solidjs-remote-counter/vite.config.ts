import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.tsx',
      formats: ['es']
    },
    rollupOptions: {
      external: ['solid-js', 'solid-js/web', 'statebuilder', 'solid-js/store'],
    }
  },
  plugins: [solid()],
})
