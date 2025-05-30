// Lint rule definitions for Markdown validation

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
export const unescapeMarkdownRule: LintRule = {
  id: 'unescape-markdown',
  name: 'Unescape Markdown Symbols',
  description: 'Remove unnecessary escaping from Markdown symbols',
  enabled: true,
  check: (content: string): LintRuleResult[] => {
    const results: LintRuleResult[] = []
    const lines = content.split('\n')

    lines.forEach((line, lineIndex) => {
      // Find escaped markdown symbols that should be unescaped
      const escapedPatterns = [
        { pattern: /\\(\*\*)/g, symbol: '**', name: 'bold marker' },
        { pattern: /\\(__)/g, symbol: '__', name: 'bold marker' },
        { pattern: /\\(\*)/g, symbol: '*', name: 'italic marker' },
        { pattern: /\\(_)/g, symbol: '_', name: 'italic marker' },
      ]

      escapedPatterns.forEach(({ pattern, symbol, name }) => {
        let match
        while ((match = pattern.exec(line)) !== null) {
          results.push({
            line: lineIndex + 1,
            column: match.index + 1,
            message: `Remove unnecessary escape from ${name} (\\${symbol} → ${symbol})`,
            ruleId: 'unescape-markdown',
            severity: 'warning',
            fixable: true,
          })
        }
      })
    })

    return results
  },
  fix: (content: string, _results: LintRuleResult[]): string => {
    let fixedContent = content

    // Remove escaping from common markdown symbols
    fixedContent = fixedContent.replace(/\\(\*\*)/g, '$1') // \** → **
    fixedContent = fixedContent.replace(/\\(__)/g, '$1') // \__ → __
    fixedContent = fixedContent.replace(/\\(\*)/g, '$1') // \* → *
    fixedContent = fixedContent.replace(/\\(_)/g, '$1') // \_ → _

    return fixedContent
  },
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
      const match = line.match(/^(#{1,6})([^\s#].*)/)
      if (match) {
        results.push({
          line: lineIndex + 1,
          column: match[1].length + 1,
          message: 'Heading markers should be followed by a space',
          ruleId: 'heading-space',
          severity: 'error',
          fixable: true,
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
  },
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
        fixable: true,
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
  },
}

export const mathFormulaRule: LintRule = {
  id: 'math-formula',
  name: 'Math Formula Format',
  description: 'Ensure proper math formula formatting with proper delimiters',
  enabled: true,
  check: (content: string): LintRuleResult[] => {
    const results: LintRuleResult[] = []
    const lines = content.split('\n')

    lines.forEach((line, lineIndex) => {
      // Check for improper $$ usage (should be on separate lines for display math)
      if (line.includes('$$') && line.trim() !== '$$') {
        const matches = line.matchAll(/\$\$/g)
        for (const match of matches) {
          if (match.index !== undefined) {
            const beforeText = line.slice(0, match.index).trim()
            const afterText = line.slice(match.index + 2).trim()

            if (beforeText || afterText) {
              results.push({
                line: lineIndex + 1,
                column: match.index + 1,
                message: 'Display math ($$) should be on separate lines',
                ruleId: 'math-formula',
                severity: 'warning',
                fixable: true,
              })
            }
          }
        }
      }

      // Check for single $ with spaces that should probably be escaped
      const singleDollarMatches = line.matchAll(/\$(?!\$)([^$]*)\$(?!\$)/g)
      for (const match of singleDollarMatches) {
        if (match.index !== undefined && match[1]) {
          const content = match[1].trim()
          // If content doesn't look like math (no math symbols), suggest escaping
          if (!/[+\-*/=<>^_{}\\]/.test(content) && !/[a-zA-Z]/.test(content)) {
            results.push({
              line: lineIndex + 1,
              column: match.index + 1,
              message: 'Consider escaping $ if not used for math',
              ruleId: 'math-formula',
              severity: 'warning',
              fixable: false,
            })
          }
        }
      }
    })

    return results
  },
  fix: (content: string, results: LintRuleResult[]): string => {
    const lines = content.split('\n')

    results
      .filter(r => r.ruleId === 'math-formula' && r.fixable)
      .sort((a, b) => b.line - a.line || b.column - a.column)
      .forEach(result => {
        const lineIndex = result.line - 1
        const line = lines[lineIndex]

        if (result.message.includes('Display math')) {
          // Fix $$ on same line issue
          const parts = line.split('$$')
          if (parts.length >= 3) {
            // Replace the line with proper formatting
            const before = parts[0].trim()
            const mathContent = parts[1]
            const after = parts.slice(2).join('$$').trim()

            const newLines = []
            if (before) newLines.push(before)
            newLines.push('$$')
            newLines.push(mathContent)
            newLines.push('$$')
            if (after) newLines.push(after)

            lines.splice(lineIndex, 1, ...newLines)
          }
        }
      })

    return lines.join('\n')
  },
}

export const emphasisStyleRule: LintRule = {
  id: 'emphasis-style',
  name: 'Emphasis Style Consistency',
  description: 'Use consistent emphasis style (* vs _)',
  enabled: true,
  check: (content: string): LintRuleResult[] => {
    const results: LintRuleResult[] = []
    const lines = content.split('\n')

    lines.forEach((line, lineIndex) => {
      // Check for escaped asterisks that should be unescaped emphasis
      const escapedAsteriskMatches = line.matchAll(/\\(\*)/g)
      for (const match of escapedAsteriskMatches) {
        if (match.index !== undefined) {
          // Check if this could be emphasis instead
          const before = line[match.index - 1] || ' '
          const after = line[match.index + 2] || ' '

          if (/\s/.test(before) && !/\s/.test(after)) {
            results.push({
              line: lineIndex + 1,
              column: match.index + 1,
              message: 'Consider using unescaped * for emphasis instead of \\*',
              ruleId: 'emphasis-style',
              severity: 'warning',
              fixable: true,
            })
          }
        }
      }

      // Check for underscore emphasis and suggest asterisks
      const underscoreMatches = line.matchAll(/(?<!\\)_([^_]+)_/g)
      for (const match of underscoreMatches) {
        if (match.index !== undefined) {
          results.push({
            line: lineIndex + 1,
            column: match.index + 1,
            message: 'Consider using * for emphasis instead of _',
            ruleId: 'emphasis-style',
            severity: 'warning',
            fixable: true,
          })
        }
      }
    })

    return results
  },
  fix: (content: string, _results: LintRuleResult[]): string => {
    let fixedContent = content

    // Fix underscore emphasis to asterisk
    fixedContent = fixedContent.replace(/(?<!\\)_([^_]+)_/g, '*$1*')

    // Fix some escaped asterisks that should be emphasis
    // This is conservative - only fix obvious cases
    fixedContent = fixedContent.replace(/\s\\(\*\w)/g, ' *$1')

    return fixedContent
  },
}

export const listMarkerRule: LintRule = {
  id: 'list-marker-style',
  name: 'List Marker Style',
  description: 'Use consistent list marker style',
  enabled: true,
  check: (content: string): LintRuleResult[] => {
    const results: LintRuleResult[] = []
    const lines = content.split('\n')

    lines.forEach((line, lineIndex) => {
      // Check for list items using + or - and suggest *
      const listMatch = line.match(/^(\s*)([+-])(\s+)/)
      if (listMatch) {
        results.push({
          line: lineIndex + 1,
          column: listMatch[1].length + 1,
          message: `Consider using * for list items instead of ${listMatch[2]}`,
          ruleId: 'list-marker-style',
          severity: 'warning',
          fixable: true,
        })
      }
    })

    return results
  },
  fix: (content: string, results: LintRuleResult[]): string => {
    const lines = content.split('\n')

    results
      .filter(r => r.ruleId === 'list-marker-style')
      .forEach(result => {
        const lineIndex = result.line - 1
        const line = lines[lineIndex]
        lines[lineIndex] = line.replace(/^(\s*)([+-])(\s+)/, '$1*$3')
      })

    return lines.join('\n')
  },
}

export const boldSpacingRule: LintRule = {
  id: 'bold-spacing',
  name: 'Bold Spacing',
  description: 'Add spaces around bold text',
  enabled: true,
  check: (content: string): LintRuleResult[] => {
    const results: LintRuleResult[] = []
    const lines = content.split('\n')

    lines.forEach((line, lineIndex) => {
      // Check for bold text without spaces
      const boldRegex = /[^\s](\*\*[^*]+\*\*)|(\*\*[^*]+\*\*)[^\s]/g
      let match
      while ((match = boldRegex.exec(line)) !== null) {
        results.push({
          line: lineIndex + 1,
          column: match.index + 1,
          message: 'Bold text should have spaces before and after',
          ruleId: 'bold-spacing',
          severity: 'warning',
          fixable: true,
        })
      }
    })

    return results
  },
  fix: (content: string): string => {
    return content.replace(/(\S)(\*\*[^*]+\*\*)/g, '$1 $2')
                 .replace(/(\*\*[^*]+\*\*)(\S)/g, '$1 $2')
  },
}

export const defaultRules: LintRule[] = [
  unescapeMarkdownRule,
  headingSpaceRule,
  fenceCloseRule,
  mathFormulaRule,
  emphasisStyleRule,
  listMarkerRule,
  boldSpacingRule,
]

export const getLintRuleById = (id: string): LintRule | undefined => {
  return defaultRules.find(rule => rule.id === id)
}

export const getEnabledRules = (enabledRuleIds: string[]): LintRule[] => {
  return defaultRules.filter(rule => enabledRuleIds.includes(rule.id))
}
