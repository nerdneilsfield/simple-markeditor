import { useAppStore } from '../store'

const themes = [
  { key: 'github', name: 'GitHub', description: 'Clean and minimal GitHub-style' },
  { key: 'notion', name: 'Notion', description: 'Modern Notion-inspired design' },
  { key: 'typora', name: 'Typora', description: 'Classic Typora editor style' },
  { key: 'academic', name: 'Academic', description: 'Professional academic paper format' }
]

export const ThemeSelector: React.FC = () => {
  const { selectedTheme, setTheme } = useAppStore()

  return (
    <div className="theme-selector">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Theme
      </label>
      <div className="grid grid-cols-1 gap-2">
        {themes.map((theme) => (
          <label
            key={theme.key}
            className={`
              flex items-center p-3 border rounded-lg cursor-pointer transition-colors
              ${selectedTheme === theme.key
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }
            `}
          >
            <input
              type="radio"
              name="theme"
              value={theme.key}
              checked={selectedTheme === theme.key}
              onChange={(e) => setTheme(e.target.value)}
              className="sr-only"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {theme.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {theme.description}
              </div>
            </div>
            {selectedTheme === theme.key && (
              <div className="text-blue-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </label>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <strong>Current theme:</strong> {themes.find(t => t.key === selectedTheme)?.name}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Theme affects both preview and PDF export styling
        </div>
      </div>
    </div>
  )
}

export default ThemeSelector