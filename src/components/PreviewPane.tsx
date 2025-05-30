import { useEffect, useRef, useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import Prism from 'prismjs'
import markedKatex from 'marked-katex-extension'
import markedFootnote from 'marked-footnote'
import mermaid from 'mermaid'

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
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-csharp'
import 'prismjs/components/prism-ruby'
import 'prismjs/components/prism-kotlin'
import 'prismjs/components/prism-swift'
import 'prismjs/components/prism-dart'
import 'prismjs/components/prism-scala'
import 'prismjs/components/prism-r'
import 'prismjs/components/prism-matlab'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-xml-doc'
import 'prismjs/components/prism-docker'
import 'prismjs/components/prism-nginx'
import 'prismjs/components/prism-shell-session'
import 'prismjs/components/prism-powershell'
import 'prismjs/components/prism-scheme'
import 'prismjs/components/prism-haskell'
import 'prismjs/components/prism-elixir'
import 'prismjs/components/prism-erlang'
import 'prismjs/components/prism-lua'
import 'prismjs/components/prism-perl'
import 'prismjs/components/prism-vim'
import 'prismjs/components/prism-diff'
import 'prismjs/components/prism-verilog'
import 'prismjs/components/prism-vhdl'

interface PreviewPaneProps {
  markdown: string
  theme: string
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  markdown,
  theme,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Configure marked options for GFM support
  const markedOptions = useMemo(() => {
    marked.setOptions({
      gfm: true,
      breaks: true,
    })

    // Custom renderer for code blocks with PrismJS highlighting and Mermaid support
    const renderer = new marked.Renderer()

    renderer.code = (code, language, _escaped) => {
      // Handle Mermaid diagrams
      if (language === 'mermaid') {
        const id = `mermaid-${Math.random().toString(36).substring(2, 15)}`
        // Return a div that will be processed by Mermaid after iframe loads
        return `<div class="mermaid-container"><div class="mermaid-diagram" data-mermaid-id="${id}" data-mermaid-code="${encodeURIComponent(code)}">${code}</div></div>`
      }

      // Handle syntax highlighting with Prism
      if (language && Prism.languages[language]) {
        try {
          const highlighted = Prism.highlight(
            code,
            Prism.languages[language],
            language
          )
          return `<pre class="language-${language}"><code class="language-${language}">${highlighted}</code></pre>`
        } catch (error) {
          console.warn(
            `PrismJS highlighting failed for language '${language}':`,
            error
          )
          // Fallback to plain code block
          return `<pre class="language-${language}"><code class="language-${language}">${code}</code></pre>`
        }
      }
      
      // Plain code block for unknown languages
      return `<pre><code>${code}</code></pre>`
    }

    // Add target="_blank" and rel="noopener noreferrer" to external links
    renderer.link = (href, title, text) => {
      const isExternal =
        href && (href.startsWith('http') || href.startsWith('//'))
      const titleAttr = title ? ` title="${title}"` : ''
      const targetAttr = isExternal
        ? ' target="_blank" rel="noopener noreferrer"'
        : ''
      return `<a href="${href}"${titleAttr}${targetAttr}>${text}</a>`
    }

    // Custom list renderer to handle task lists
    renderer.list = (body, ordered, start) => {
      const type = ordered ? 'ol' : 'ul'
      const startAttr = ordered && start !== 1 ? ` start="${start}"` : ''
      return `<${type}${startAttr}>\n${body}</${type}>\n`
    }

    // Custom list item renderer for task lists
    renderer.listitem = (text, task, checked) => {
      if (task) {
        const checkedAttr = checked ? ' checked disabled' : ' disabled'
        const checkedClass = checked ? 'task-checked' : 'task-unchecked'
        return `<li class="task-item ${checkedClass}">
          <input type="checkbox"${checkedAttr}> ${text}
        </li>\n`
      }
      return `<li>${text}</li>\n`
    }

    // Configure KaTeX extension
    const katexOptions = {
      throwOnError: false,
      errorColor: '#cc0000',
      macros: {
        '\\f': '#1f(#2)',
      },
      strict: false,
      trust: false,
      output: 'html' as const,
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
    }

    // Manual heading ID generation using renderer extension
    const customRenderer = {
      heading(text: string, level: number) {
        const anchor = text
          .toLowerCase()
          .replace(/[^\w\- ]/g, '')
          .replace(/\s+/g, '-')
          .replace(/--+/g, '-')
          .replace(/^-|-$/g, '')
        return `<h${level} id="heading-${anchor}">${text}</h${level}>\n`
      },
    }

    marked.use({ renderer: customRenderer })
    marked.use({ renderer })
    marked.use(markedKatex(katexOptions))
    marked.use(markedFootnote())
    return marked
  }, [theme])

  // Convert markdown to HTML with sanitization
  const htmlContent = useMemo(() => {
    const rawHtml = markedOptions(markdown)
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'br',
        'strong',
        'em',
        'u',
        's',
        'del',
        'ins',
        'a',
        'img',
        'ul',
        'ol',
        'li',
        'dl',
        'dt',
        'dd',
        'table',
        'thead',
        'tbody',
        'tfoot',
        'tr',
        'th',
        'td',
        'blockquote',
        'pre',
        'code',
        'hr',
        'div',
        'span',
        'sup',
        'sub',
        'input',
        'section',
        'svg',
        'g',
        'path',
        'rect',
        'circle',
        'ellipse',
        'line',
        'polyline',
        'polygon',
        'text',
        'tspan',
        'marker',
        'defs',
        'clipPath',
        'mask',
        'pattern',
        'image',
        'switch',
        'foreignObject',
        'annotation',
        'semantics',
        'math',
        'mi',
        'mn',
        'mo',
        'mrow',
        'msup',
        'msub',
        'mfrac',
        'msqrt',
        'mroot',
        'mtext',
        'mspace',
        'mover',
        'munder',
        'munderover',
        'mtable',
        'mtr',
        'mtd',
      ],
      ALLOWED_ATTR: [
        'href',
        'title',
        'alt',
        'src',
        'width',
        'height',
        'class',
        'id',
        'target',
        'rel',
        'data-*',
        'viewBox',
        'xmlns',
        'xml:lang',
        'aria-*',
        'role',
        'fill',
        'stroke',
        'stroke-width',
        'x',
        'y',
        'x1',
        'y1',
        'x2',
        'y2',
        'cx',
        'cy',
        'r',
        'rx',
        'ry',
        'd',
        'points',
        'transform',
        'style',
        'font-family',
        'font-size',
        'text-anchor',
        'dominant-baseline',
        'mathvariant',
        'mathsize',
        'mathcolor',
        'mathbackground',
        'displaystyle',
        'scriptlevel',
        'type',
        'checked',
        'disabled',
      ],
      ALLOW_DATA_ATTR: true,
      ADD_TAGS: ['foreignObject'],
      ADD_ATTR: ['data-mermaid-id', 'data-mermaid-code', 'data-processed'],
    })
  }, [markdown, markedOptions])

  // Update iframe content
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) return

    // Initialize Mermaid with GitHub-proven solutions
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === 'dark' ? 'dark' : 'default',
        securityLevel: 'strict', // Use strict for better security
        fontFamily: 'inherit',
        maxTextSize: 50000,
        maxEdges: 2000, // Increase for large diagrams
        flowchart: {
          useMaxWidth: false, // Disable for better overflow handling
          htmlLabels: true,
          curve: 'basis',
          padding: 15,
          nodeSpacing: 50,
          rankSpacing: 50,
        },
        sequence: {
          useMaxWidth: false, // Consistent with flowchart
          boxMargin: 10,
          diagramMarginX: 50,
          diagramMarginY: 10,
          actorMargin: 50,
          width:
            typeof window !== 'undefined' && window.innerWidth > 768
              ? 150
              : 100,
          height: 65,
          boxTextMargin: 5,
          noteMargin: 10,
          messageMargin: 35,
        },
        gantt: {
          useMaxWidth: false,
          leftPadding: 75,
          gridLineStartPadding: 35,
          fontSize: 11,
          sectionFontSize: 24,
          numberSectionStyles: 4,
        },
        er: {
          useMaxWidth: false,
        },
        themeVariables: {
          primaryColor: '#fff',
          primaryTextColor: '#000',
          primaryBorderColor: '#000',
          lineColor: '#000',
          fontFamily: 'arial',
          fontSize: '16px',
        },
      })
    } catch (error) {
      console.error('Mermaid initialization failed:', error)
    }

    // Create complete HTML document for iframe
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; img-src 'self' data: https: http: blob:; style-src 'self' 'unsafe-inline' data: blob: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; font-src 'self' data: https:; frame-src 'self' blob: data:; worker-src 'self' blob:; media-src 'self' data: blob:;">
          <title>Preview</title>
          <link rel="stylesheet" href="/src/themes/${theme}.css">
          <link rel="stylesheet" href="/node_modules/katex/dist/katex.min.css">
          <link rel="stylesheet" href="/node_modules/prismjs/themes/prism.css">
          <style>
            /* Firefox CSP compatibility - inline styles as fallback */
            @import url('/node_modules/katex/dist/katex.min.css');
            @import url('/node_modules/prismjs/themes/prism.css');
            
            /* Core reset for Firefox compatibility */
            * { box-sizing: border-box; }
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: system-ui, -apple-system, sans-serif; 
              line-height: 1.6;
              background: #fff;
              color: #000;
            }
            
            /* KaTeX fallback styles for Firefox */
            .katex { 
              font-size: 1.1em; 
              line-height: 1.2; 
              display: inline-block; 
            }
            .katex-display { 
              display: block; 
              text-align: center; 
              margin: 1em 0; 
            }
            
            /* PrismJS and highlight.js fallback styles for Firefox */
            pre[class*="language-"], pre[class*="hljs"] {
              background: #f5f5f5;
              border: 1px solid #ddd;
              border-radius: 4px;
              padding: 1em;
              overflow: auto;
              font-family: Consolas, Monaco, 'Andale Mono', monospace;
              font-size: 0.9em;
              line-height: 1.4;
            }
            code[class*="language-"], code[class*="hljs"] {
              color: #333;
              background: transparent;
              font-family: Consolas, Monaco, 'Andale Mono', monospace;
            }
            
            /* Extended tables styling */
            table {
              border-collapse: collapse;
              margin: 1em 0;
              width: 100%;
            }
            table th, table td {
              border: 1px solid #ddd;
              padding: 8px 12px;
              text-align: left;
            }
            table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            
            /* Heading anchors styling */
            h1[id], h2[id], h3[id], h4[id], h5[id], h6[id] {
              position: relative;
            }
            h1[id]:hover::before, h2[id]:hover::before, h3[id]:hover::before,
            h4[id]:hover::before, h5[id]:hover::before, h6[id]:hover::before {
              content: '#';
              position: absolute;
              left: -1.2em;
              color: #666;
              opacity: 0.7;
              font-weight: normal;
              text-decoration: none;
            }
            
            /* Footnotes styling */
            .footnotes {
              border-top: 1px solid #ddd;
              margin-top: 2em;
              padding-top: 1em;
              font-size: 0.9em;
            }
            .footnotes ol {
              padding-left: 1.5em;
            }
            .footnote-ref {
              vertical-align: super;
              font-size: 0.8em;
              text-decoration: none;
              color: #0066cc;
            }
            .footnote-backref {
              text-decoration: none;
              color: #0066cc;
            }
            /* Mermaid diagram styling - GitHub proven solutions */
            .mermaid-container {
              margin: 1.5rem 0;
              text-align: center;
              overflow-x: auto; /* Allow horizontal scroll for large diagrams */
              padding: 1rem;
              background: rgba(0, 0, 0, 0.02);
              border-radius: 8px;
              border: 1px solid rgba(0, 0, 0, 0.1);
              min-height: 200px;
              width: 100%;
              max-width: 100%;
            }
            .mermaid-diagram {
              width: 100%;
              overflow-x: auto;
              max-width: 100%;
              display: block;
            }
            .mermaid-diagram svg {
              max-width: none !important; /* Allow SVG to exceed container */
              height: auto !important;
              display: block;
              margin: 0 auto;
              width: auto !important;
            }
            /* Support for long labels */
            .mermaid .node rect,
            .mermaid .node circle,
            .mermaid .node polygon {
              fill: transparent;
              stroke: #333;
              stroke-width: 1.5px;
            }
            .mermaid .node text {
              font-family: arial;
              font-size: 14px;
              word-break: break-word;
            }
            /* Responsive adjustments */
            @media (max-width: 768px) {
              .mermaid-diagram svg {
                max-width: none;
                width: auto;
              }
            }
            /* KaTeX styling fixes */
            .katex {
              font-size: 1.1em;
            }
            .katex-display {
              margin: 1em 0;
              text-align: center;
            }
            .katex-display > .katex {
              display: inline-block;
              text-align: initial;
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

    // Process Mermaid diagrams with GitHub-proven solutions
    const processMermaidDiagrams = async () => {
      const mermaidElements = iframeDoc.querySelectorAll('.mermaid-diagram')

      for (let index = 0; index < mermaidElements.length; index++) {
        const element = mermaidElements[index]

        // Clean up data-processed attributes before re-rendering
        element.removeAttribute('data-processed')

        const code = decodeURIComponent(
          element.getAttribute('data-mermaid-code') || ''
        )
        const baseId =
          element.getAttribute('data-mermaid-id') ||
          `mermaid-${index}-${Date.now()}`

        if (code && code.trim()) {
          try {
            // Clear any existing content
            element.innerHTML = 'Loading diagram...'

            // Use unique ID to avoid conflicts with timestamp
            const uniqueId = `${baseId}-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`

            // Robust rendering with error handling
            const { svg } = await mermaid.render(uniqueId, code)

            element.innerHTML = svg

            // Apply GitHub-proven SVG sizing fixes
            const svgElement = element.querySelector('svg')
            if (svgElement) {
              // Remove useMaxWidth constraints for better overflow handling
              svgElement.style.maxWidth = 'none'
              svgElement.style.height = 'auto'
              svgElement.style.display = 'block'
              svgElement.style.margin = '0 auto'

              // Convert width/height attributes to CSS for better control
              if (svgElement.hasAttribute('width')) {
                const width = svgElement.getAttribute('width')
                if (width && !width.includes('%')) {
                  svgElement.style.width = width.includes('px')
                    ? width
                    : width + 'px'
                }
                svgElement.removeAttribute('width')
              }
              if (svgElement.hasAttribute('height')) {
                const height = svgElement.getAttribute('height')
                if (height && !height.includes('%')) {
                  svgElement.style.height = height.includes('px')
                    ? height
                    : height + 'px'
                }
                svgElement.removeAttribute('height')
              }

              // Ensure proper viewBox handling for responsive scaling
              if (!svgElement.hasAttribute('viewBox')) {
                const bbox = svgElement.getBBox()
                if (bbox.width && bbox.height) {
                  svgElement.setAttribute(
                    'viewBox',
                    `0 0 ${bbox.width} ${bbox.height}`
                  )
                }
              }
            }
          } catch (error) {
            console.error('Mermaid rendering error:', error)
            element.innerHTML = `<div style="padding: 1em; background: #fee; border: 1px solid #fcc; border-radius: 4px; color: #c33; text-align: left;">
              <strong>Mermaid Error:</strong><br>
              <small>${error instanceof Error ? error.message : 'Unknown error'}</small>
              <br><br>
              <strong>Code:</strong><br>
              <pre style="font-size: 12px; margin: 0; white-space: pre-wrap; overflow-x: auto;">${code}</pre>
            </div>`
          }
        } else {
          element.innerHTML = `<div style="padding: 1em; background: #fee; border: 1px solid #fcc; border-radius: 4px; color: #c33;">
            <strong>Mermaid Error:</strong><br>
            <small>Empty or invalid diagram code</small>
          </div>`
        }
      }
    }

    // Wait for iframe to be fully loaded, then process diagrams
    window.setTimeout(() => {
      processMermaidDiagrams()
    }, 200)
  }, [htmlContent, theme])

  return (
    <div className="preview-pane h-full border-l border-gray-200 dark:border-gray-700">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        sandbox="allow-same-origin allow-scripts"
        title="Markdown Preview"
      />
    </div>
  )
}

export default PreviewPane
