import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LintSettings {
  escapeAsterisk: boolean
  headingSpace: boolean
  fenceClose: boolean
}

export interface AppState {
  // Content
  markdown: string
  setMarkdown: (markdown: string) => void
  
  // Theme
  selectedTheme: string
  setTheme: (theme: string) => void
  
  // Language
  language: string
  setLanguage: (language: string) => void
  
  // Lint settings
  lintSettings: LintSettings
  setLintSettings: (settings: Partial<LintSettings>) => void
  
  // UI state
  isSettingsOpen: boolean
  setSettingsOpen: (open: boolean) => void
  
  isMobilePreviewMode: boolean
  setMobilePreviewMode: (preview: boolean) => void
  
  // Auto-save
  lastSaved: number
  setLastSaved: (timestamp: number) => void
  
  // Actions
  exportToPDF: () => void
  reset: () => void
}

const DEFAULT_MARKDOWN = `# Welcome to Simple Markdown Editor

Start typing your markdown here...

## Features

- ✨ **Real-time preview** with syntax highlighting
- 🎨 **Multiple themes** (GitHub, Notion, Typora, Academic)
- 📄 **PDF export** using browser print
- 🧹 **Markdown linting** with auto-fix
- 💾 **Auto-save** to localStorage
- 📱 **Mobile-friendly** with adaptive editor

## Example

Here's some \`code\` and a [link](https://example.com).

\`\`\`typescript
const hello = (name: string) => {
  console.log(\`Hello, \${name}!\`)
}
\`\`\`

> This is a blockquote with **bold** and *italic* text.

### Task List

- [x] Set up project
- [ ] Add more features
- [ ] Write documentation

| Feature | Status |
|---------|--------|
| Editor  | ✅ Done |
| Preview | ✅ Done |
| Themes  | 🚧 WIP |
`

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Content
      markdown: DEFAULT_MARKDOWN,
      setMarkdown: (markdown: string) => {
        set({ markdown, lastSaved: Date.now() })
        
        // Auto-save to localStorage
        localStorage.setItem('md-content', markdown)
      },
      
      // Theme
      selectedTheme: 'github',
      setTheme: (theme: string) => {
        set({ selectedTheme: theme })
        localStorage.setItem('selected-theme', theme)
      },
      
      // Language
      language: 'en',
      setLanguage: (language: string) => {
        set({ language })
        localStorage.setItem('i18n-lang', language)
      },
      
      // Lint settings
      lintSettings: {
        escapeAsterisk: true,
        headingSpace: true,
        fenceClose: true,
      },
      setLintSettings: (newSettings: Partial<LintSettings>) => {
        const current = get().lintSettings
        const updated = { ...current, ...newSettings }
        set({ lintSettings: updated })
        localStorage.setItem('lint-settings', JSON.stringify(updated))
      },
      
      // UI state
      isSettingsOpen: false,
      setSettingsOpen: (open: boolean) => set({ isSettingsOpen: open }),
      
      isMobilePreviewMode: false,
      setMobilePreviewMode: (preview: boolean) => set({ isMobilePreviewMode: preview }),
      
      // Auto-save
      lastSaved: Date.now(),
      setLastSaved: (timestamp: number) => set({ lastSaved: timestamp }),
      
      // Actions
      exportToPDF: () => {
        // Apply print styles and trigger print dialog
        const printStyles = document.createElement('style')
        printStyles.textContent = `
          @media print {
            .toolbar, .settings-drawer, .editor-container {
              display: none !important;
            }
            .preview-pane {
              width: 100% !important;
              height: auto !important;
              border: none !important;
            }
            body {
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `
        document.head.appendChild(printStyles)
        
        // Trigger print
        window.print()
        
        // Clean up styles after printing
        window.addEventListener('afterprint', () => {
          document.head.removeChild(printStyles)
        }, { once: true })
      },
      
      reset: () => {
        localStorage.removeItem('md-content')
        localStorage.removeItem('selected-theme')
        localStorage.removeItem('i18n-lang')
        localStorage.removeItem('lint-settings')
        
        set({
          markdown: DEFAULT_MARKDOWN,
          selectedTheme: 'github',
          language: 'en',
          lintSettings: {
            escapeAsterisk: true,
            headingSpace: true,
            fenceClose: true,
          },
          isSettingsOpen: false,
          isMobilePreviewMode: false,
          lastSaved: Date.now(),
        })
      }
    }),
    {
      name: 'markdown-editor-storage',
      partialize: (state) => ({
        selectedTheme: state.selectedTheme,
        language: state.language,
        lintSettings: state.lintSettings,
      }),
    }
  )
)

// Initialize from localStorage on startup
export const initializeStore = () => {
  const store = useAppStore.getState()
  
  // Load markdown content
  const savedMarkdown = localStorage.getItem('md-content')
  if (savedMarkdown) {
    store.setMarkdown(savedMarkdown)
  }
  
  // Load theme
  const savedTheme = localStorage.getItem('selected-theme')
  if (savedTheme) {
    store.setTheme(savedTheme)
  }
  
  // Load language
  const savedLanguage = localStorage.getItem('i18n-lang')
  if (savedLanguage) {
    store.setLanguage(savedLanguage)
  }
  
  // Load lint settings
  const savedLintSettings = localStorage.getItem('lint-settings')
  if (savedLintSettings) {
    try {
      const settings = JSON.parse(savedLintSettings)
      store.setLintSettings(settings)
    } catch (e) {
      console.warn('Failed to parse lint settings from localStorage')
    }
  }
  
  // Set up auto-save listener
  window.addEventListener('editor-save', (event: any) => {
    const content = event.detail?.content
    if (content !== undefined) {
      store.setMarkdown(content)
    }
  })
}