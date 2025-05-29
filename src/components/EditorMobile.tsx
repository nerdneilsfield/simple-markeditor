import { useRef, useEffect } from 'react'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'

interface EditorMobileProps {
  value: string
  onChange: (value: string) => void
  theme: string
}

export const EditorMobile: React.FC<EditorMobileProps> = ({
  value,
  onChange,
  theme
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    const extensions = [
      markdown(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString())
        }
      }),
      EditorView.theme({
        '&': {
          fontSize: '16px', // Prevent zoom on mobile
          fontFamily: '"SF Mono", "Monaco", "Inconsolata", monospace'
        },
        '.cm-content': {
          padding: '16px',
          lineHeight: '1.6'
        },
        '.cm-focused': {
          outline: 'none'
        },
        '.cm-editor': {
          height: '100%'
        },
        '.cm-scroller': {
          fontSize: '16px'
        }
      })
    ]

    // Add dark theme if needed
    if (theme === 'dark') {
      extensions.push(oneDark)
    }

    const state = EditorState.create({
      doc: value,
      extensions
    })

    const view = new EditorView({
      state,
      parent: editorRef.current
    })

    viewRef.current = view

    // Add save functionality
    const handleSave = () => {
      const event = new CustomEvent('editor-save', { 
        detail: { content: view.state.doc.toString() } 
      })
      window.dispatchEvent(event)
    }

    // Listen for Ctrl+S (mobile keyboards might support this)
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    document.addEventListener('keydown', handleKeydown)

    return () => {
      view.destroy()
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [theme]) // Re-create editor when theme changes

  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value
        }
      })
    }
  }, [value])

  return (
    <div className="editor-mobile h-full">
      <div ref={editorRef} className="h-full" />
    </div>
  )
}

export default EditorMobile