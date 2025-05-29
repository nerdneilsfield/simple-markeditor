import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkLint from 'remark-lint'
import type { VFile } from 'vfile'

export interface LintRuleResult {
  line: number
  column: number
  message: string
  ruleId: string
  severity: 'error' | 'warning'
  fixable: boolean
  fix?: () => string
}

export interface LintRule {
  id: string
  name: string
  description: string
  enabled: boolean
  check: (content: string) => LintRuleResult[]
  fix?: (content: string, results: LintRuleResult[]) => string
}

// Custom lint rules
export const escapeAsteriskRule: LintRule = {
  id: 'escape-asterisk',
  name: 'Escape Asterisk',
  description: 'Escape asterisks that are not part of emphasis',
  enabled: true,
  check: (content: string): LintRuleResult[] => {
    const results: LintRuleResult[] = []
    const lines = content.split('\n')
    
    lines.forEach((line, lineIndex) => {
      // Find standalone asterisks that should be escaped
      const regex = /(?<![\*\\])\*(?!\*|[a-zA-Z])/g
      let match
      
      while ((match = regex.exec(line)) !== null) {
        results.push({
          line: lineIndex + 1,
          column: match.index + 1,
          message: 'Asterisk should be escaped to avoid confusion with emphasis',
          ruleId: 'escape-asterisk',
          severity: 'warning',
          fixable: true
        })
      }
    })
    
    return results
  },
  fix: (content: string, results: LintRuleResult[]): string => {
    const lines = content.split('\n')
    
    // Sort results by line and column in reverse order to avoid index shifts
    const sortedResults = results
      .filter(r => r.ruleId === 'escape-asterisk')
      .sort((a, b) => b.line - a.line || b.column - a.column)
    
    sortedResults.forEach(result => {
      const lineIndex = result.line - 1
      const line = lines[lineIndex]
      const charIndex = result.column - 1
      
      if (line && line[charIndex] === '*') {
        lines[lineIndex] = line.slice(0, charIndex) + '\\*' + line.slice(charIndex + 1)
      }
    })
    
    return lines.join('\n')
  }
}

export const headingSpaceRule: LintRule = {
  id: 'heading-space',
  name: 'Heading Space',
  description: 'Require space after heading markers',
  enabled: true,
  check: (content: string): LintRuleResult[] => {
    const results: LintRuleResult[] = []
    const lines = content.split('\n')
    
    lines.forEach((line, lineIndex) => {
      // Check for headings without proper spacing
      const match = line.match(/^(#{1,6})([^\s#].*)/);
      if (match) {
        results.push({
          line: lineIndex + 1,
          column: match[1].length + 1,
          message: 'Heading markers should be followed by a space',
          ruleId: 'heading-space',
          severity: 'error',
          fixable: true
        })
      }
    })
    
    return results
  },
  fix: (content: string, results: LintRuleResult[]): string => {
    const lines = content.split('\n')
    
    results
      .filter(r => r.ruleId === 'heading-space')
      .forEach(result => {
        const lineIndex = result.line - 1
        const line = lines[lineIndex]
        const match = line.match(/^(#{1,6})([^\s#].*)/)
        
        if (match) {
          lines[lineIndex] = match[1] + ' ' + match[2]
        }
      })
    
    return lines.join('\n')
  }
}

export const fenceCloseRule: LintRule = {
  id: 'fence-close',
  name: 'Fence Close',
  description: 'Require closing fences for code blocks',
  enabled: true,
  check: (content: string): LintRuleResult[] => {
    const results: LintRuleResult[] = []
    const lines = content.split('\n')
    let inCodeBlock = false
    let codeBlockStart = -1
    let fencePattern = ''
    
    lines.forEach((line, lineIndex) => {
      const fenceMatch = line.match(/^(\s*)(```|~~~)(.*)$/)
      
      if (fenceMatch && !inCodeBlock) {
        // Starting a code block
        inCodeBlock = true
        codeBlockStart = lineIndex
        fencePattern = fenceMatch[2]
      } else if (fenceMatch && inCodeBlock && fenceMatch[2] === fencePattern) {
        // Closing the code block
        inCodeBlock = false
        codeBlockStart = -1
        fencePattern = ''
      }
    })
    
    // If we're still in a code block at the end, it's unclosed
    if (inCodeBlock && codeBlockStart >= 0) {
      results.push({
        line: codeBlockStart + 1,
        column: 1,
        message: 'Code block is not properly closed',
        ruleId: 'fence-close',
        severity: 'error',
        fixable: true
      })
    }
    
    return results
  },
  fix: (content: string, results: LintRuleResult[]): string => {
    const lines = content.split('\n')
    
    results
      .filter(r => r.ruleId === 'fence-close')
      .forEach(result => {
        const lineIndex = result.line - 1
        const line = lines[lineIndex]
        const fenceMatch = line.match(/^(\s*)(```|~~~)(.*)$/)
        
        if (fenceMatch) {
          // Add closing fence at the end
          lines.push('')
          lines.push(fenceMatch[1] + fenceMatch[2])
        }
      })
    
    return lines.join('\n')
  }
}

export const defaultRules: LintRule[] = [
  escapeAsteriskRule,
  headingSpaceRule,
  fenceCloseRule
]

export const getLintRuleById = (id: string): LintRule | undefined => {
  return defaultRules.find(rule => rule.id === id)
}

export const getEnabledRules = (enabledRuleIds: string[]): LintRule[] => {
  return defaultRules.filter(rule => enabledRuleIds.includes(rule.id))
}