import { useEffect, useRef, useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import Prism from 'prismjs'

// Import common Prism languages
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-rust'

interface PreviewPaneProps {
  markdown: string
  theme: string
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({ markdown, theme }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Configure marked options for GFM support
  const markedOptions = useMemo(() => {
    marked.setOptions({
      gfm: true,
      breaks: true
    })

    // Custom renderer for code blocks with Prism highlighting
    const renderer = new marked.Renderer()
    
    renderer.code = (code, language) => {
      if (language && Prism.languages[language]) {
        const highlighted = Prism.highlight(code, Prism.languages[language], language)
        return `<pre class="language-${language}"><code class="language-${language}">${highlighted}</code></pre>`
      }
      return `<pre><code>${code}</code></pre>`
    }

    // Add target="_blank" and rel="noopener noreferrer" to external links
    renderer.link = (href, title, text) => {
      const isExternal = href && (href.startsWith('http') || href.startsWith('//'))
      const titleAttr = title ? ` title="${title}"` : ''
      const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${href}"${titleAttr}${targetAttr}>${text}</a>`
    }

    marked.use({ renderer })
    return marked
  }, [])

  // Convert markdown to HTML with sanitization
  const htmlContent = useMemo(() => {
    if (!markdown.trim()) {
      return `
        <div class="empty-state">
          <h2>Welcome to Simple Markdown Editor</h2>
          <p>Start typing in the editor to see the preview here.</p>
          <h3>Features:</h3>
          <ul>
            <li>✨ Real-time preview</li>
            <li>🎨 Multiple themes</li>
            <li>📄 PDF export</li>
            <li>🧹 Markdown linting</li>
            <li>💾 Auto-save</li>
          </ul>
        </div>
      `
    }

    const rawHtml = markedOptions(markdown)
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'strong', 'em', 'u', 's', 'del', 'ins',
        'a', 'img', 'ul', 'ol', 'li', 'dl', 'dt', 'dd',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
        'blockquote', 'pre', 'code', 'hr',
        'div', 'span', 'sup', 'sub'
      ],
      ALLOWED_ATTR: [
        'href', 'title', 'alt', 'src', 'width', 'height',
        'class', 'id', 'target', 'rel', 'data-*'
      ],
      ALLOW_DATA_ATTR: true
    })
  }, [markdown, markedOptions])

  // Update iframe content
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) return

    // Create complete HTML document for iframe
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Preview</title>
          <link rel="stylesheet" href="/src/themes/${theme}.css">
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              line-height: 1.6;
              color: var(--text-color, #333);
              background: var(--bg-color, #fff);
              max-width: none;
            }
            
            .empty-state {
              text-align: center;
              color: var(--text-muted, #666);
              margin-top: 2rem;
            }
            
            .empty-state h2 {
              color: var(--text-color, #333);
              margin-bottom: 1rem;
            }
            
            .empty-state ul {
              text-align: left;
              display: inline-block;
              margin-top: 1rem;
            }
            
            /* Prism.js theme integration */
            pre[class*="language-"] {
              margin: 1em 0;
              padding: 1em;
              border-radius: 6px;
              overflow: auto;
              background: var(--code-bg, #f6f8fa);
            }
            
            code[class*="language-"] {
              font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
              font-size: 0.9em;
            }
            
            /* Base syntax highlighting colors */
            .token.comment { color: var(--syntax-comment, #6a737d); }
            .token.string { color: var(--syntax-string, #032f62); }
            .token.keyword { color: var(--syntax-keyword, #d73a49); }
            .token.function { color: var(--syntax-function, #6f42c1); }
            .token.number { color: var(--syntax-number, #005cc5); }
            
            /* Print styles */
            @media print {
              body {
                margin: 0;
                padding: 1cm;
                font-size: 12pt;
                line-height: 1.4;
                color: #000;
                background: #fff;
              }
              
              h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid;
                margin-top: 1em;
                margin-bottom: 0.5em;
              }
              
              pre, blockquote {
                page-break-inside: avoid;
              }
              
              a[href]:after {
                content: " (" attr(href) ")";
                font-size: 0.8em;
                color: #666;
              }
              
              .empty-state {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `

    iframeDoc.open()
    iframeDoc.write(fullHtml)
    iframeDoc.close()
  }, [htmlContent, theme])

  return (
    <div className="preview-pane h-full border-l border-gray-200 dark:border-gray-700">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        sandbox="allow-same-origin"
        title="Markdown Preview"
      />
    </div>
  )
}

export default PreviewPane