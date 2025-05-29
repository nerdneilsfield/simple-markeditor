import { lazy, Suspense } from 'react'
import { useIsMobile } from '../hooks/useDevice'

const EditorDesktop = lazy(() => import('./EditorDesktop'))
const EditorMobile = lazy(() => import('./EditorMobile'))

interface EditorProps {
  value: string
  onChange: (value: string | undefined) => void
  theme: string
}

const EditorFallback = () => (
  <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-gray-500 dark:text-gray-400">Loading editor...</div>
  </div>
)

export const Editor: React.FC<EditorProps> = ({ value, onChange, theme }) => {
  const isMobile = useIsMobile()

  const handleChange = (newValue: string | undefined) => {
    onChange(newValue || '')
  }

  return (
    <Suspense fallback={<EditorFallback />}>
      {isMobile ? (
        <EditorMobile 
          value={value} 
          onChange={handleChange} 
          theme={theme} 
        />
      ) : (
        <EditorDesktop 
          value={value} 
          onChange={handleChange} 
          theme={theme} 
        />
      )}
    </Suspense>
  )
}

export default Editor