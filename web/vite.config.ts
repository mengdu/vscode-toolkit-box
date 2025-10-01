import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // const isDev = mode === 'development'
  return {
    plugins: [react()],
    server: {
      port: 4321,
      strictPort: true,
      cors: true,
    },
    build: {
      emptyOutDir: true,
      outDir: path.resolve(__dirname, '../dist/web'),
      rollupOptions: {
        output: {
          entryFileNames: 'js/[name].js',
          chunkFileNames: 'js/[name]-[hash].js',
          assetFileNames: 'assets/[name].[ext]',
        }
      }
    }
  }
})
