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
  <div className="h-full flex items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
    <div className="flex flex-col items-center space-y-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <div className="text-gray-700 dark:text-gray-300 font-medium">
        Loading editor...
      </div>
    </div>
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
        <EditorMobile value={value} onChange={handleChange} theme={theme} />
      ) : (
        <EditorDesktop value={value} onChange={handleChange} theme={theme} />
      )}
    </Suspense>
  )
}

export default Editor
