import { useState, useEffect, useRef } from 'react'

interface DiffModalProps {
  isOpen: boolean
  onClose: () => void
  originalContent: string
  fixedContent: string
  onApplyFixes: () => void
}

export const DiffModal: React.FC<DiffModalProps> = ({
  isOpen,
  onClose,
  originalContent,
  fixedContent,
  onApplyFixes,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'diff' | 'preview'>('diff')

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Create diff visualization
  const createDiff = () => {
    const originalLines = originalContent.split('\n')
    const fixedLines = fixedContent.split('\n')
    const maxLines = Math.max(originalLines.length, fixedLines.length)

    const diffLines: Array<{
      type: 'unchanged' | 'added' | 'removed'
      original?: string
      fixed?: string
      lineNumber: number
    }> = []

    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || ''
      const fixedLine = fixedLines[i] || ''

      if (originalLine === fixedLine) {
        diffLines.push({
          type: 'unchanged',
          original: originalLine,
          fixed: fixedLine,
          lineNumber: i + 1,
        })
      } else if (originalLine && fixedLine) {
        // Line was modified
        diffLines.push({
          type: 'removed',
          original: originalLine,
          lineNumber: i + 1,
        })
        diffLines.push({
          type: 'added',
          fixed: fixedLine,
          lineNumber: i + 1,
        })
      } else if (originalLine) {
        // Line was removed
        diffLines.push({
          type: 'removed',
          original: originalLine,
          lineNumber: i + 1,
        })
      } else {
        // Line was added
        diffLines.push({
          type: 'added',
          fixed: fixedLine,
          lineNumber: i + 1,
        })
      }
    }

    return diffLines
  }

  const diffLines = createDiff()
  const hasChanges = originalContent !== fixedContent

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full mx-4 h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Markdown Lint Fixes
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {hasChanges
                ? 'Review the proposed changes below'
                : 'No fixes were needed'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-600">
          <button
            onClick={() => setActiveTab('diff')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'diff'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Diff View
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'preview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Fixed Content
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          {activeTab === 'diff' ? (
            <div className="h-full overflow-hidden">
              {hasChanges ? (
                <div className="grid grid-cols-2 h-full">
                  {/* Original Content (Left) */}
                  <div className="border-r border-gray-200 dark:border-gray-600 h-full flex flex-col">
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                      Original
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                      {originalContent.split('\n').map((line, index) => (
                        <div
                          key={`original-${index}`}
                          className="flex py-1 min-h-[1.25rem]"
                        >
                          <div className="w-8 text-xs text-gray-500 dark:text-gray-400 text-right mr-2 flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 whitespace-pre-wrap text-gray-900 dark:text-gray-100 break-words">
                            {line || ' '}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fixed Content (Right) */}
                  <div className="h-full flex flex-col">
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                      Fixed
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                      {fixedContent.split('\n').map((line, index) => {
                        const originalLine =
                          originalContent.split('\n')[index] || ''
                        const isChanged = line !== originalLine
                        return (
                          <div
                            key={`fixed-${index}`}
                            className={`flex py-1 min-h-[1.25rem] ${
                              isChanged
                                ? 'bg-green-50 dark:bg-green-900/20'
                                : ''
                            }`}
                          >
                            <div className="w-8 text-xs text-gray-500 dark:text-gray-400 text-right mr-2 flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 whitespace-pre-wrap text-gray-900 dark:text-gray-100 break-words">
                              {isChanged && (
                                <span className="bg-green-200 dark:bg-green-700 text-green-900 dark:text-green-100 px-1 rounded">
                                  {line || ' '}
                                </span>
                              )}
                              {!isChanged && (line || ' ')}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-lg font-medium">No changes needed</p>
                    <p className="text-sm">
                      Your Markdown is already following best practices!
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-4">
              <pre className="whitespace-pre-wrap break-words font-mono text-sm text-gray-800 dark:text-gray-200">
                {fixedContent}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-600">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {hasChanges ? (
              <>
                <span className="text-green-600 dark:text-green-400">
                  +{diffLines.filter(l => l.type === 'added').length}
                </span>{' '}
                <span className="text-red-600 dark:text-red-400">
                  -{diffLines.filter(l => l.type === 'removed').length}
                </span>{' '}
                changes
              </>
            ) : (
              'No changes to apply'
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Cancel
            </button>

            {hasChanges && (
              <button
                onClick={() => {
                  onApplyFixes()
                  onClose()
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Apply Fixes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiffModal
