import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

export default defineConfig({
  plugins: [
    react(),
    monacoEditorPlugin({})
  ],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'monaco-editor': ['@monaco-editor/react', 'monaco-editor'],
          'codemirror': ['@codemirror/view', '@codemirror/state', '@codemirror/lang-markdown'],
          'markdown': ['marked', 'prismjs', 'dompurify'],
          'lint': ['remark', 'remark-lint', 'remark-stringify', 'unified']
        }
      }
    }
  },
  define: {
    'process.env': {}
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts']
  }
  // PWA plugin placeholder for future iteration:
  // pwa({
  //   registerType: 'autoUpdate',
  //   workbox: {
  //     globPatterns: ['**/*.{js,css,html,ico,png,svg}']
  //   }
  // })
})