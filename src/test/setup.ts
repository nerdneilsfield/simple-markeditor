import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock ResizeObserver
;(globalThis as any).ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver
;(globalThis as any).IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock window.print
Object.defineProperty(window, 'print', {
  writable: true,
  value: () => {},
})

// Mock localStorage
const storage: { [key: string]: string } = {}

const localStorageMock: Storage = {
  length: Object.keys(storage).length,
  key: (_index: number) => null,
  getItem: (key: string): string | null => {
    return storage[key] || null
  },
  setItem: (key: string, value: string): void => {
    storage[key] = value
  },
  removeItem: (key: string): void => {
    delete storage[key]
  },
  clear: (): void => {
    for (const key in storage) {
      delete storage[key]
    }
  }
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock DOMPurify (handled by Vitest)
vi.mock('dompurify', () => ({
  default: {
    sanitize: (html: string) => html,
    isSupported: true
  }
}))