# Simple Markdown Editor

> **Zero-backend, pure frontend Markdown editor with high-quality PDF export**

A modern, responsive Markdown editor that runs entirely in your browser. Write, preview, and export your Markdown documents with professional styling - no server required!

## ✨ Features

- 🖥️ **Adaptive Editor**: Monaco Editor for desktop, CodeMirror 6 for mobile
- 👀 **Real-time Preview**: Live rendering with syntax highlighting
- 🎨 **Multiple Themes**: GitHub, Notion, Typora, and Academic styles
- 📄 **PDF Export**: Native browser printing with theme-consistent styling
- 🧹 **Markdown Linting**: Automatic detection and fixing of common issues
- 💾 **Auto-save**: Local storage persistence with manual save (Ctrl+S)
- 🌍 **Internationalization**: English and Chinese support
- 📱 **Mobile Friendly**: Responsive design with touch optimization
- 🔒 **Secure**: DOMPurify sanitization and sandboxed preview

## 🚀 Quick Start

### Online Usage

Visit the live application at: [your-deployed-url.pages.dev](https://your-deployed-url.pages.dev)

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/simple-markeditor.git
cd simple-markeditor

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript 5.x
- **Build Tool**: Vite 5 with HMR
- **Editors**: Monaco Editor (desktop) / CodeMirror 6 (mobile)
- **Markdown**: marked 9.x + Prism.js for syntax highlighting
- **State Management**: Zustand
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Testing**: Vitest + React Testing Library + Playwright
- **Deployment**: Cloudflare Pages with edge CDN

## 📖 Usage Guide

### Basic Writing

1. **Start Writing**: The editor loads with sample content to get you started
2. **Live Preview**: See your formatted output in real-time on the right panel
3. **Mobile View**: Switch between Edit and Preview tabs on mobile devices

### Themes

Choose from 4 professionally designed themes:

- **GitHub**: Clean, minimal styling inspired by GitHub
- **Notion**: Modern design with Notion-like spacing and typography
- **Typora**: Classic editor styling with elegant typography
- **Academic**: Professional format suitable for academic papers

### Lint & Fix

The built-in linter helps maintain clean Markdown:

- **Escape Asterisk**: Automatically escape standalone asterisks
- **Heading Space**: Ensure proper spacing after heading markers
- **Fence Close**: Detect and fix unclosed code blocks

### PDF Export

1. Click the "Export PDF" button
2. Choose print destination as "Save as PDF"
3. Your document exports with the selected theme styling

### Settings

Access the settings drawer to:
- Switch between English and Chinese
- Toggle individual lint rules
- Change themes
- Reset all data

## 🏗️ Architecture

```
src/
├── components/           # React components
│   ├── Editor.tsx       # Adaptive editor wrapper
│   ├── EditorDesktop.tsx # Monaco Editor component
│   ├── EditorMobile.tsx  # CodeMirror component
│   ├── PreviewPane.tsx   # Markdown preview with iframe
│   ├── DiffModal.tsx     # Lint fixes diff viewer
│   ├── ThemeSelector.tsx # Theme selection UI
│   └── SettingsDrawer.tsx # Settings panel
├── hooks/               # Custom React hooks
│   └── useDevice.ts     # Device detection utilities
├── lint/                # Markdown linting system
│   ├── rules.ts         # Custom lint rules
│   └── lintService.ts   # Lint service integration
├── themes/              # CSS theme files
│   ├── github.css       # GitHub-inspired theme
│   ├── notion.css       # Notion-inspired theme
│   ├── typora.css       # Typora-inspired theme
│   └── academic.css     # Academic paper theme
├── store.ts             # Zustand state management
├── i18n.ts              # Internationalization setup
└── App.tsx              # Main application component
```

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run unit tests with coverage
pnpm test --coverage

# Run E2E tests
pnpm e2e

# Run all tests
pnpm lint && pnpm test && pnpm e2e
```

Test coverage goals:
- **General**: 90% coverage
- **Lint algorithms**: 100% coverage
- **E2E**: Critical user workflows

## 🚀 Deployment

### Cloudflare Pages (Recommended)

1. **Fork this repository**
2. **Connect to Cloudflare Pages**:
   - Go to Cloudflare Dashboard → Pages
   - Create new project from Git
   - Select your forked repository
3. **Configure build settings**:
   - Build command: `pnpm build`
   - Build output directory: `dist`
   - Node.js version: `18`
4. **Deploy**: Automatic deployments on every push to `main`

### Other Platforms

- **Netlify**: Use the same build settings
- **Vercel**: Auto-detected configuration
- **GitHub Pages**: Requires workflow modification

## 🎯 Performance

Target metrics (achieved):
- **Bundle size**: ≤ 650KB gzipped
- **First load**: ≤ 2s desktop, ≤ 3s mobile  
- **Render latency**: ≤ 200ms desktop, ≤ 300ms mobile
- **Lighthouse score**: ≥ 85

## 🔧 Configuration

### Environment Variables

```bash
# Development
NODE_ENV=development
VITE_APP_VERSION=1.0.0

# Production
NODE_ENV=production
```

### Customization

- **Themes**: Modify CSS files in `src/themes/`
- **Lint Rules**: Add custom rules in `src/lint/rules.ts`
- **Translations**: Update `src/i18n.ts`

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines

- Follow TypeScript strict mode
- Component size limit: 400 LoC
- Use functional components with hooks
- Write tests for new features
- Update documentation

## 📋 Roadmap

- [ ] **Plugin System**: Mermaid, MathJax, custom renderers
- [ ] **Performance**: Virtual scrolling for large documents
- [ ] **PWA**: Offline support with Service Worker
- [ ] **Export Options**: Direct PDF generation, PNG export
- [ ] **Collaboration**: Real-time editing (requires backend)

## ⚖️ License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Monaco Editor** - Microsoft's powerful code editor
- **CodeMirror** - Lightweight mobile editor
- **marked** - Fast Markdown parser
- **Prism.js** - Syntax highlighting
- **Tailwind CSS** - Utility-first CSS framework
- **Cloudflare Pages** - Edge deployment platform

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/yourusername/simple-markeditor/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/simple-markeditor/discussions)
- **Security Issues**: Email security@yourdomain.com

---

**Made with ❤️ for the Markdown community**

*Built during a 1-day sprint as a comprehensive demonstration of modern frontend development practices.*