import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      title: 'Markdown Editor',
      editor: 'Editor',
      preview: 'Preview',
      theme: 'Theme',
      export: 'Export PDF',
      lint: 'Lint & Fix',
      settings: 'Settings',
      autoSave: 'Auto Save',
      themes: {
        github: 'GitHub',
        notion: 'Notion',
        typora: 'Typora',
        academic: 'Academic'
      },
      lint_rules: {
        escape_asterisk: 'Escape Asterisk',
        heading_space: 'Heading Space',
        fence_close: 'Fence Close'
      },
      diff: {
        title: 'Markdown Fix Preview',
        apply: 'Apply Fixes',
        cancel: 'Cancel'
      },
      toolbar: {
        theme: 'Switch Theme',
        export: 'Export to PDF',
        lint: 'Lint & Fix Markdown',
        settings: 'Open Settings'
      },
      settings_drawer: {
        title: 'Settings',
        language: 'Language',
        lint_rules: 'Lint Rules',
        about: 'About',
        version: 'Version',
        reset: 'Reset All Data'
      },
      status: {
        saved: 'Saved',
        saving: 'Saving...',
        auto_save: 'Auto-save enabled'
      }
    }
  },
  'zh-CN': {
    translation: {
      title: 'Markdown 编辑器',
      editor: '编辑器',
      preview: '预览',
      theme: '主题',
      export: '导出 PDF',
      lint: '检查修复',
      settings: '设置',
      autoSave: '自动保存',
      themes: {
        github: 'GitHub',
        notion: 'Notion',
        typora: 'Typora',
        academic: '学术'
      },
      lint_rules: {
        escape_asterisk: '转义星号',
        heading_space: '标题空格',
        fence_close: '代码块闭合'
      },
      diff: {
        title: 'Markdown 修复预览',
        apply: '应用修复',
        cancel: '取消'
      },
      toolbar: {
        theme: '切换主题',
        export: '导出为 PDF',
        lint: '检查并修复 Markdown',
        settings: '打开设置'
      },
      settings_drawer: {
        title: '设置',
        language: '语言',
        lint_rules: '语法规则',
        about: '关于',
        version: '版本',
        reset: '重置所有数据'
      },
      status: {
        saved: '已保存',
        saving: '保存中...',
        auto_save: '自动保存已启用'
      }
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n