import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // const isDev = mode === 'development'
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 4321,
      strictPort: true,
      cors: true,
    },
    base: '/_DIST_',
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
