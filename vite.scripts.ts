import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    ssr: 'scripts/run-codegen.ts',
    outDir: 'dist-scripts',
  },
})
