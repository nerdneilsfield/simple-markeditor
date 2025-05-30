import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'monaco-editor': ['@monaco-editor/react', 'monaco-editor'],
          codemirror: [
            '@codemirror/view',
            '@codemirror/state',
            '@codemirror/lang-markdown',
          ],
          markdown: [
            'marked',
            'prismjs',
            'dompurify',
            'marked-katex-extension',
            'marked-footnote',
            'katex',
          ],
          diagrams: ['mermaid'],
          lint: ['remark', 'remark-lint', 'remark-stringify', 'unified'],
        },
      },
    },
  },
  define: {
    'process.env': {},
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/playwright-report/**',
    ],
    include: ['**/tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
  // PWA plugin placeholder for future iteration:
  // pwa({
  //   registerType: 'autoUpdate',
  //   workbox: {
  //     globPatterns: ['**/*.{js,css,html,ico,png,svg}']
  //   }
  // })
})
