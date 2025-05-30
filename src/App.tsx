import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore, initializeStore } from './store'
import { useIsMobile } from './hooks/useDevice'
import { lintService } from './lint/lintService'
import Editor from './components/Editor'
import PreviewPane from './components/PreviewPane'
import DiffModal from './components/DiffModal'
import SettingsDrawer from './components/SettingsDrawer'
import ExportDropdown from './components/ExportDropdown'
import './i18n'

function App() {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  const {
    markdown,
    setMarkdown,
    selectedTheme,
    isSettingsOpen,
    setSettingsOpen,
    isMobilePreviewMode,
    setMobilePreviewMode,
    lintSettings,
    exportToPDF,
    exportForDesktop,
    exportForMobile,
    exportForEReader,
    formatMarkdown,
    fixMarkdown,
  } = useAppStore()

  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false)
  const [lintReport, setLintReport] = useState<{
    original: string
    fixed: string
  } | null>(null)
  const [isLinting, setIsLinting] = useState(false)

  // Initialize store on app start
  useEffect(() => {
    initializeStore()
  }, [])

  // Update lint service when settings change
  useEffect(() => {
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

    lintService.setEnabledRules(enabledRules)
  }, [lintSettings])

  const handleLintAndFix = async () => {
    if (isLinting) return

    setIsLinting(true)
    try {
      const report = await lintService.lintWithFixes(markdown)

      if (report.fixedContent && report.fixedContent !== markdown) {
        setLintReport({
          original: markdown,
          fixed: report.fixedContent,
        })
        setIsDiffModalOpen(true)
      } else {
        // No fixes needed, show a message
        alert(t('No lint issues found! ✅'))
      }
    } catch (error) {
      console.error('Lint error:', error)
      alert('Error running lint checks')
    } finally {
      setIsLinting(false)
    }
  }

  const handleApplyFixes = () => {
    if (lintReport?.fixed) {
      setMarkdown(lintReport.fixed)
      setLintReport(null)
    }
  }

  const handleEditorChange = (value: string | undefined) => {
    setMarkdown(value || '')
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('title')}
          </h1>

          <div className="flex items-center space-x-3">
            {/* Mobile view toggle */}
            {isMobile && (
              <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                <button
                  onClick={() => setMobilePreviewMode(false)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    !isMobilePreviewMode
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {t('editor')}
                </button>
                <button
                  onClick={() => setMobilePreviewMode(true)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    isMobilePreviewMode
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {t('preview')}
                </button>
              </div>
            )}

            {/* Export Options */}
            <ExportDropdown
              onExportPrint={exportToPDF}
              onExportDesktop={exportForDesktop}
              onExportMobile={exportForMobile}
              onExportEReader={exportForEReader}
            />

            {/* Format */}
            <button
              onClick={formatMarkdown}
              title="Format with Prettier"
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              ✨ Format
            </button>

            {/* Fix */}
            <button
              onClick={fixMarkdown}
              title="Fix with lint rules"
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              🔧 Fix
            </button>

            {/* Lint & Fix */}
            <button
              onClick={handleLintAndFix}
              disabled={isLinting}
              title={t('toolbar.lint')}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
            >
              {isLinting ? '⏳' : '🧹'} {t('lint')}
            </button>

            {/* Settings */}
            <button
              onClick={() => setSettingsOpen(!isSettingsOpen)}
              title={t('toolbar.settings')}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {isMobile ? (
          // Mobile layout: stacked with tab switching
          <div className="flex-1">
            {isMobilePreviewMode ? (
              <PreviewPane markdown={markdown} theme={selectedTheme} />
            ) : (
              <Editor
                value={markdown}
                onChange={handleEditorChange}
                theme={selectedTheme}
              />
            )}
          </div>
        ) : (
          // Desktop layout: side by side
          <>
            <div className="flex-1 border-r border-gray-200 dark:border-gray-700">
              <Editor
                value={markdown}
                onChange={handleEditorChange}
                theme={selectedTheme}
              />
            </div>
            <div className="flex-1">
              <PreviewPane markdown={markdown} theme={selectedTheme} />
            </div>
          </>
        )}
      </div>

      {/* Settings drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Diff modal */}
      {isDiffModalOpen && lintReport && (
        <DiffModal
          isOpen={isDiffModalOpen}
          onClose={() => {
            setIsDiffModalOpen(false)
            setLintReport(null)
          }}
          originalContent={lintReport.original}
          fixedContent={lintReport.fixed}
          onApplyFixes={handleApplyFixes}
        />
      )}
    </div>
  )
}

export default App
