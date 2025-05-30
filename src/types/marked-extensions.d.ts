// Type definitions for marked extensions that don't have TypeScript definitions

declare module 'marked-extended-tables' {
  interface ExtendedTablesOptions {
    headerIds?: boolean
    [key: string]: unknown
  }

  function extendedTables(options?: ExtendedTablesOptions): unknown
  export = extendedTables
}

declare module 'marked-highlight' {
  interface HighlightOptions {
    langPrefix?: string
    highlight?: (code: string, lang: string) => string
    [key: string]: unknown
  }

  export function markedHighlight(options?: HighlightOptions): unknown
}
