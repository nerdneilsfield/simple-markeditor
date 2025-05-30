import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { exportService, type ExportOptions } from './services/exportService'

export interface LintSettings {
  unescapeMarkdown: boolean
  headingSpace: boolean
  fenceClose: boolean
  mathFormula: boolean
  emphasisStyle: boolean
  listMarkerStyle: boolean
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
  exportWithOptions: (options?: ExportOptions) => Promise<void>
  exportForDesktop: () => Promise<void>
  exportForMobile: () => Promise<void>
  exportForEReader: () => Promise<void>
  formatMarkdown: () => Promise<void>
  fixMarkdown: () => Promise<void>
  reset: () => void
}

const DEFAULT_MARKDOWN = `# Simple Markdown Editor

一个功能强大的 Markdown 编辑器，支持数学公式、图表和多种主题。
A powerful Markdown editor with math, diagrams, and multiple themes.

## ✨ 核心功能 Core Features

- 🚀 **实时预览** Real-time preview with adaptive editor  
- 🔢 **数学公式** Math equations: $E = mc^2$ and $$\\sum_{i=1}^n x_i$$
- 📊 **Mermaid 图表** Diagrams and flowcharts
- 🎨 **7种专业主题** Professional themes (GitHub, Academic, Scientific, etc.)
- 🧹 **Markdown 检查** Linting with auto-fix
- 💾 **自动保存** Auto-save to localStorage
- 📄 **PDF 导出** High-quality PDF export
- 🌍 **多语言支持** Full CJK support: 中文 • 日本語 • 한국어

## 📐 数学公式 Math Formulas

内联数学 Inline math: 二次公式 $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$

显示数学 Display math:
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

矩阵 Matrix:
$$\\begin{pmatrix}
a & b \\\\\\\\
c & d
\\end{pmatrix}$$

更复杂的公式 Complex formulas:
$$\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$$

$$E = mc^2$$

微积分 Calculus:
$$\\frac{d}{dx} \\int_a^x f(t) dt = f(x)$$

## 📊 Mermaid 图表 Diagrams

\`\`\`mermaid
graph TD
    A[开始 Start] --> B{决策 Decision}
    B -->|是 Yes| C[操作1 Action 1]
    B -->|否 No| D[操作2 Action 2]
    C --> E[结束 End]
    D --> E
\`\`\`

流程图 Flowchart:
\`\`\`mermaid
sequenceDiagram
    participant A as 用户 User
    participant B as 系统 System
    A->>B: 请求 Request
    B-->>A: 响应 Response
\`\`\`

## 💻 代码高亮 Code Highlighting

TypeScript 示例:
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  created: Date;
}

const createUser = (data: Partial<User>): User => {
  return {
    id: Date.now(),
    created: new Date(),
    ...data
  };
};

// 使用泛型 Using generics
function apiCall<T>(endpoint: string): Promise<T> {
  return fetch(endpoint).then(res => res.json());
}
\`\`\`

Python 示例:
\`\`\`python
import numpy as np
import matplotlib.pyplot as plt

def fibonacci(n):
    """计算斐波那契数列"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 生成数据
x = np.linspace(0, 10, 100)
y = np.sin(x) * np.exp(-x/5)

plt.plot(x, y, 'b-', label='衰减正弦波')
plt.legend()
plt.show()
\`\`\`

## ✅ 任务列表 Task Lists

### 项目进度 Project Progress
- [x] ✅ 基础编辑器 Basic editor
- [x] ✅ 实时预览 Live preview  
- [x] ✅ 主题系统 Theme system
- [x] ✅ 数学公式 Math formulas
- [x] ✅ Mermaid 图表 Diagrams
- [x] ✅ 代码高亮 Code highlighting
- [ ] 🚧 插件系统 Plugin system
- [ ] 📱 移动端优化 Mobile optimization
- [ ] 🔄 协同编辑 Collaborative editing

### 待完成功能 TODO Features
- [x] 脚注支持 Footnote support[^1]
- [ ] 表格编辑器 Table editor
- [ ] 图片上传 Image upload  
- [ ] 导出到其他格式 Export to other formats

## 📋 表格示例 Table Example

| 功能 Feature | 状态 Status | 描述 Description | 优先级 Priority |
|-------------|------------|-----------------|----------------|
| 数学公式 Math | ✅ 完成 | KaTeX 渲染 | 🔴 高 High |
| 图表 Diagrams | ✅ 完成 | Mermaid 支持 | 🔴 高 High |
| 主题 Themes | ✅ 完成 | 7种专业主题 | 🟡 中 Medium |
| 导出 Export | ✅ 完成 | PDF 导出 | 🟡 中 Medium |
| 检查 Linting | ✅ 完成 | 自动修复 | 🟢 低 Low |

## 📝 引用和链接 Quotes & Links

> **提示 Tip:** 使用设置面板切换主题，体验不同的视觉效果！  
> Use the settings panel to switch between themes for different visual experiences!

> 这是一个包含**粗体**和*斜体*文本的多行引用。  
> 支持中英文混排和各种格式。
>
> --- 简单 Markdown 编辑器

相关链接 Links:
- [Markdown 语法指南](https://www.markdownguide.org/)[^2]
- [KaTeX 文档](https://katex.org/docs/supported.html)[^3] 
- [Mermaid 图表语法](https://mermaid-js.github.io/mermaid/)[^4]

## 📝 脚注示例 Footnote Examples

这是一个包含脚注的段落[^note1]。你还可以使用数字脚注[^5]，或者自定义的脚注标识符[^custom-footnote]。

脚注在学术写作[^academic]和技术文档中非常有用，可以提供额外的信息而不打断主要的叙述流程。

## 🎨 主题演示 Theme Showcase

当前支持的主题 Available themes:
1. **GitHub** - 经典 GitHub 风格
2. **Notion** - 现代 Notion 设计  
3. **Typora** - 优雅 Typora 样式
4. **Academic** - 学术论文格式
5. **Minimal** - 简约清爽风格
6. **Dark Pro** - 专业深色主题
7. **Scientific** - 科研文档优化

---

**开始编辑 Start Editing!** 🚀  
删除这些示例内容，开始创作你的文档吧！  
Delete this example content and start creating your own documents!

---

## 📚 脚注 Footnotes

[^1]: 脚注功能已完成实现！现在支持完整的脚注语法。Footnote support is now fully implemented!

[^2]: Markdown 是一种轻量级标记语言，由 John Gruber 于 2004 年创建。

[^3]: KaTeX 是一个快速、易用的 JavaScript 库，用于在 Web 上渲染数学符号。

[^4]: Mermaid 是一个基于 JavaScript 的图表工具，它使用 Markdown 风格的语法来创建图表。

[^5]: 数字脚注是最常见的脚注类型，通常用于学术论文和技术文档中。

[^note1]: 这是一个自定义标识符的脚注示例，展示了脚注的灵活性。

[^custom-footnote]: 你可以使用任何字符串作为脚注标识符，这在组织复杂文档时非常有用。

[^academic]: 在学术写作中，脚注用于提供引用、额外说明或相关信息，帮助读者更好地理解内容。`

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
        unescapeMarkdown: true,
        headingSpace: true,
        fenceClose: true,
        mathFormula: true,
        emphasisStyle: true,
        listMarkerStyle: true,
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
      setMobilePreviewMode: (preview: boolean) =>
        set({ isMobilePreviewMode: preview }),

      // Auto-save
      lastSaved: Date.now(),
      setLastSaved: (timestamp: number) => set({ lastSaved: timestamp }),

      // Actions
      exportToPDF: () => {
        // Legacy print function for backward compatibility
        exportService.exportForPrint().then(result => {
          if (!result.success) {
            alert(result.message)
          }
        })
      },

      exportWithOptions: async (options?: ExportOptions) => {
        try {
          const result = await exportService.exportWithFormat(
            options?.format || 'pdf',
            options
          )
          if (!result.success) {
            alert(result.message)
          }
        } catch (error) {
          console.error('Export error:', error)
          alert('Export failed. Please try again.')
        }
      },

      exportForDesktop: async () => {
        try {
          const result = await exportService.exportForDesktop()
          if (!result.success) {
            alert(result.message)
          }
        } catch (error) {
          console.error('Desktop export error:', error)
          alert('Desktop export failed. Please try again.')
        }
      },

      exportForMobile: async () => {
        try {
          const result = await exportService.exportForMobile()
          if (!result.success) {
            alert(result.message)
          }
        } catch (error) {
          console.error('Mobile export error:', error)
          alert('Mobile export failed. Please try again.')
        }
      },

      exportForEReader: async () => {
        try {
          const result = await exportService.exportForEReader()
          if (!result.success) {
            alert(result.message)
          }
        } catch (error) {
          console.error('E-reader export error:', error)
          alert('E-reader export failed. Please try again.')
        }
      },

      formatMarkdown: async () => {
        const { markdown } = get()

        try {
          // Import prettier dynamically with standalone bundle
          const prettier = await import('prettier/standalone')
          const parserMarkdown = await import('prettier/plugins/markdown')

          // Format with prettier using standalone bundle with markdown plugin
          const formatted = await prettier.format(markdown, {
            parser: 'markdown',
            plugins: [parserMarkdown],
            printWidth: 80,
            proseWrap: 'preserve',
            singleQuote: false,
            trailingComma: 'none',
            bracketSpacing: true,
            endOfLine: 'lf',
          })

          set({ markdown: formatted.trim(), lastSaved: Date.now() })
          localStorage.setItem('md-content', formatted.trim())
        } catch (error) {
          console.error('Prettier formatting failed:', error)

          // Fallback to basic formatting
          let formatted = markdown

          // Fix line spacing issues
          formatted = formatted.replace(/\n{3,}/g, '\n\n')

          // Fix heading spacing
          formatted = formatted.replace(/^(#{1,6})([^\s#])/gm, '$1 $2')

          // Fix list formatting
          formatted = formatted.replace(/^(\s*)[-+](\s+)/gm, '$1* $2')

          // Fix emphasis consistency
          formatted = formatted.replace(/(?<!\\)_([^_]+)_/g, '*$1*')

          // Fix trailing whitespace
          formatted = formatted
            .split('\n')
            .map(line => line.trimEnd())
            .join('\n')

          set({ markdown: formatted, lastSaved: Date.now() })
          localStorage.setItem('md-content', formatted)
        }
      },

      fixMarkdown: async () => {
        const { markdown, lintSettings } = get()

        try {
          // Dynamic import to avoid require
          const { lintService } = await import('./lint/lintService')

          // Get enabled rules based on settings
          const enabledRules = Object.entries(lintSettings)
            .filter(([_, enabled]) => enabled)
            .map(([key, _]) => {
              // Convert camelCase to kebab-case
              if (key === 'unescapeMarkdown') return 'unescape-markdown'
              if (key === 'headingSpace') return 'heading-space'
              if (key === 'fenceClose') return 'fence-close'
              if (key === 'mathFormula') return 'math-formula'
              if (key === 'emphasisStyle') return 'emphasis-style'
              if (key === 'listMarkerStyle') return 'list-marker-style'
              return key
            })

          // Set enabled rules and run lint with fixes
          lintService.setEnabledRules(enabledRules)
          const report = await lintService.lintWithFixes(markdown)

          if (report.fixedContent && report.fixedContent !== markdown) {
            set({ markdown: report.fixedContent, lastSaved: Date.now() })
            localStorage.setItem('md-content', report.fixedContent)
          }
        } catch (error) {
          console.error('Fix markdown failed:', error)
        }
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
            unescapeMarkdown: true,
            headingSpace: true,
            fenceClose: true,
            mathFormula: true,
            emphasisStyle: true,
            listMarkerStyle: true,
          },
          isSettingsOpen: false,
          isMobilePreviewMode: false,
          lastSaved: Date.now(),
        })
      },
    }),
    {
      name: 'markdown-editor-storage',
      partialize: state => ({
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
    } catch {
      console.warn('Failed to parse lint settings from localStorage')
    }
  }

  // Set up auto-save listener
  window.addEventListener('editor-save', (event: Event) => {
    const customEvent = event as CustomEvent
    const content = customEvent.detail?.content
    if (content !== undefined) {
      store.setMarkdown(content)
    }
  })
}
