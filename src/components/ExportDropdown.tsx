import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface ExportDropdownProps {
  onExportPrint: () => void
  onExportDesktop: () => Promise<void>
  onExportMobile: () => Promise<void>
  onExportEReader: () => Promise<void>
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  onExportPrint,
  onExportDesktop,
  onExportMobile,
  onExportEReader,
}) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        dropdownRef.current &&
        event.target &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleExport = async (exportFn: () => void | Promise<void>) => {
    setIsExporting(true)
    setIsOpen(false)
    try {
      await exportFn()
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportOptions = [
    {
      id: 'print',
      label: 'Print / Save as PDF',
      description: 'Use browser print dialog',
      icon: '🖨️',
      action: () => handleExport(onExportPrint),
    },
    {
      id: 'desktop',
      label: 'Desktop PDF',
      description: 'High-quality, large margins',
      icon: '🖥️',
      action: () => handleExport(onExportDesktop),
    },
    {
      id: 'mobile',
      label: 'Mobile PDF',
      description: 'Optimized for mobile viewing',
      icon: '📱',
      action: () => handleExport(onExportMobile),
    },
    {
      id: 'ereader',
      label: 'E-Reader PDF',
      description: 'Compact for e-readers',
      icon: '📖',
      action: () => handleExport(onExportEReader),
    },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Export Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
        title={t('toolbar.export')}
      >
        {isExporting ? (
          <>
            <div className="animate-spin w-4 h-4 mr-1 border-2 border-white border-t-transparent rounded-full"></div>
            Exporting...
          </>
        ) : (
          <>
            📄 {t('export')}
            <svg
              className={`ml-1 w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Export Options
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Choose the format optimized for your needs
            </p>
          </div>

          <div className="py-2">
            {exportOptions.map(option => (
              <button
                key={option.id}
                onClick={option.action}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start">
                  <span className="text-lg mr-3 mt-0.5">{option.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {option.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Tip: Use "Print" option for most compatibility, or try the
              optimized formats for better results.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExportDropdown
