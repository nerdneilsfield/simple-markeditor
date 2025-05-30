# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Simple Markdown Editor - A web-based Markdown editor with real-time preview, multi-theme support, and PDF export capability. Built as a 100% frontend SPA with no backend dependencies.

## Tech Stack

- **Frontend**: React 18 + TypeScript 5.x
- **Build Tool**: Vite 5
- **Editors**: Monaco Editor (desktop) / CodeMirror 6 (mobile)
- **Markdown**: marked 9.x + Prism.js for syntax highlighting
- **State**: Zustand
- **Testing**: Vitest + React Testing Library + Playwright

## Development Commands

```bash
pnpm dev      # Start local dev server with HMR
pnpm build    # Production build to dist/
pnpm preview  # Preview production build
pnpm test     # Run unit tests
pnpm e2e      # Run E2E tests
pnpm lint     # ESLint + Prettier check
```

## Architecture

The application follows a modular architecture:

- **Editor Module**: Monaco/CodeMirror integration with adaptive loading
- **Preview Module**: Real-time rendering in sandboxed iframe with DOMPurify
- **Theme System**: Plugin-based themes (GitHub, Notion, Typora, Academic)
- **Lint System**: Extensible markdown linting with visual diff and auto-fix
- **Storage**: LocalStorage/IndexedDB for offline persistence

## Key Implementation Details

1. **Performance Targets**:

   - Bundle size: ≤ 650KB gzipped
   - First load: ≤ 2s desktop, ≤ 3s mobile
   - Render latency: ≤ 200ms desktop, ≤ 300ms mobile

2. **Security**:

   - All preview content rendered in sandboxed iframe
   - DOMPurify for HTML sanitization
   - CSP headers configured

3. **Component Guidelines**:

   - Use functional components with TypeScript
   - Component size limit: 400 LoC
   - Strict TypeScript mode enabled

4. **Testing Requirements**:
   - 90% general coverage
   - 100% coverage for lint/fix algorithms
   - E2E tests for critical workflows

## Current Status

Project is in planning phase with comprehensive documentation. Implementation has not started yet. When beginning development, start with:

1. Initialize Vite + React + TypeScript project
2. Set up Monaco Editor integration
3. Implement basic markdown preview with marked
4. Add LocalStorage persistence
5. Implement theme system
