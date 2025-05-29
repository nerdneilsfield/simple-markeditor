import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store'
import { defaultRules } from '../lint/rules'
import ThemeSelector from './ThemeSelector'

interface SettingsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation()
  const drawerRef = useRef<HTMLDivElement>(null)
  
  const { 
    language,
    setLanguage,
    lintSettings,
    setLintSettings,
    reset
  } = useAppStore()

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    i18n.changeLanguage(newLanguage)
  }

  // Handle lint setting toggle
  const handleLintToggle = (ruleId: string, enabled: boolean) => {
    if (ruleId === 'escape-asterisk') {
      setLintSettings({ escapeAsterisk: enabled })
    } else if (ruleId === 'heading-space') {
      setLintSettings({ headingSpace: enabled })
    } else if (ruleId === 'fence-close') {
      setLintSettings({ fenceClose: enabled })
    }
  }

  const getLintSettingValue = (ruleId: string): boolean => {
    if (ruleId === 'escape-asterisk') return lintSettings.escapeAsterisk
    if (ruleId === 'heading-space') return lintSettings.headingSpace
    if (ruleId === 'fence-close') return lintSettings.fenceClose
    return false
  }

  const handleReset = () => {
    if (confirm(t('Are you sure you want to reset all data? This cannot be undone.'))) {
      reset()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:z-40">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 lg:bg-transparent"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        ref={drawerRef}
        className={`
          absolute right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl
          transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('settings_drawer.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Language Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('settings_drawer.language')}
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="language"
                  value="en"
                  checked={language === 'en'}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-900 dark:text-gray-100">English</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="language"
                  value="zh-CN"
                  checked={language === 'zh-CN'}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-900 dark:text-gray-100">中文</span>
              </label>
            </div>
          </div>

          {/* Theme Settings */}
          <div>
            <ThemeSelector />
          </div>

          {/* Lint Rules */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('settings_drawer.lint_rules')}
            </label>
            <div className="space-y-3">
              {defaultRules.map((rule) => (
                <label key={rule.id} className="flex items-start">
                  <input
                    type="checkbox"
                    checked={getLintSettingValue(rule.id)}
                    onChange={(e) => handleLintToggle(rule.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                  />
                  <div className="ml-3">
                    <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {t(`lint_rules.${rule.id.replace('-', '_')}`)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {rule.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* About Section */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('settings_drawer.about')}
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <div>
                <span className="font-medium">{t('settings_drawer.version')}:</span> 1.0.0
              </div>
              <div>
                <span className="font-medium">Build:</span> {new Date().toISOString().split('T')[0]}
              </div>
              <div className="text-xs">
                Zero-backend Markdown editor with PDF export
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <button
              onClick={handleReset}
              className="w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
            >
              {t('settings_drawer.reset')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsDrawer