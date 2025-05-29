import { useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import type { editor } from 'monaco-editor'

interface EditorDesktopProps {
  value: string
  onChange: (value: string | undefined) => void
  theme: string
}

export const EditorDesktop: React.FC<EditorDesktopProps> = ({
  value,
  onChange,
  theme
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
    
    // Configure editor options for Markdown
    editor.updateOptions({
      wordWrap: 'on',
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: '"Fira Code", "Monaco", "Menlo", monospace',
      lineHeight: 1.6,
      automaticLayout: true,
      suggest: {
        showKeywords: false,
        showSnippets: false,
        showFunctions: false,
        showConstructors: false,
        showFields: false,
        showVariables: false,
        showClasses: false,
        showStructs: false,
        showInterfaces: false,
        showModules: false,
        showProperties: false,
        showEvents: false,
        showOperators: false,
        showUnits: false,
        showValues: false,
        showConstants: false,
        showEnums: false,
        showEnumMembers: false,
        showColors: false,
        showFiles: false,
        showReferences: false,
        showFolders: false,
        showTypeParameters: false,
        showUsers: false,
        showIssues: false,
      }
    })

    // Add Ctrl+S save functionality
    editor.addCommand(2048 + 49, () => { // Ctrl+S
      const event = new CustomEvent('editor-save', { detail: { content: editor.getValue() } })
      window.dispatchEvent(event)
    })
  }

  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs'

  return (
    <div className="editor-desktop h-full">
      <Editor
        height="100%"
        defaultLanguage="markdown"
        theme={monacoTheme}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          wordWrap: 'on',
          lineNumbers: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          fontFamily: '"Fira Code", "Monaco", "Menlo", monospace',
          lineHeight: 1.6,
          automaticLayout: true
        }}
      />
    </div>
  )
}

export default EditorDesktop