import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkLint from 'remark-lint'
import type { LintRuleResult, LintRule } from './rules'
import { defaultRules, getEnabledRules } from './rules'

export interface LintReport {
  results: LintRuleResult[]
  fixedContent?: string
  hasErrors: boolean
  hasWarnings: boolean
}

export class LintService {
  private enabledRules: LintRule[] = defaultRules

  constructor(enabledRuleIds?: string[]) {
    if (enabledRuleIds) {
      this.enabledRules = getEnabledRules(enabledRuleIds)
    }
  }

  setEnabledRules(enabledRuleIds: string[]): void {
    this.enabledRules = getEnabledRules(enabledRuleIds)
  }

  async lint(content: string): Promise<LintReport> {
    const allResults: LintRuleResult[] = []

    // Run each enabled rule
    for (const rule of this.enabledRules) {
      try {
        const results = rule.check(content)
        allResults.push(...results)
      } catch (error) {
        console.warn(`Error running lint rule ${rule.id}:`, error)
      }
    }

    // Also run remark-lint for additional checks
    try {
      const file = await unified()
        .use(remarkParse)
        .use(remarkLint)
        .process(content)

      // Convert remark lint messages to our format
      file.messages.forEach(message => {
        if (message.line && message.column) {
          allResults.push({
            line: message.line,
            column: message.column,
            message: message.message,
            ruleId: message.ruleId || 'remark-lint',
            severity: message.fatal ? 'error' : 'warning',
            fixable: false
          })
        }
      })
    } catch (error) {
      console.warn('Error running remark-lint:', error)
    }

    // Sort results by line and column
    allResults.sort((a, b) => a.line - b.line || a.column - b.column)

    const hasErrors = allResults.some(r => r.severity === 'error')
    const hasWarnings = allResults.some(r => r.severity === 'warning')

    return {
      results: allResults,
      hasErrors,
      hasWarnings
    }
  }

  applyFixes(content: string, results: LintRuleResult[]): string {
    let fixedContent = content

    // Group results by rule ID
    const resultsByRule = new Map<string, LintRuleResult[]>()
    results.forEach(result => {
      if (result.fixable) {
        const ruleResults = resultsByRule.get(result.ruleId) || []
        ruleResults.push(result)
        resultsByRule.set(result.ruleId, ruleResults)
      }
    })

    // Apply fixes for each rule
    for (const [ruleId, ruleResults] of resultsByRule) {
      const rule = this.enabledRules.find(r => r.id === ruleId)
      if (rule && rule.fix) {
        try {
          fixedContent = rule.fix(fixedContent, ruleResults)
        } catch (error) {
          console.warn(`Error applying fix for rule ${ruleId}:`, error)
        }
      }
    }

    return fixedContent
  }

  async lintWithFixes(content: string): Promise<LintReport> {
    const report = await this.lint(content)
    
    if (report.results.some(r => r.fixable)) {
      const fixedContent = this.applyFixes(content, report.results)
      
      // Re-lint the fixed content to get updated results
      const fixedReport = await this.lint(fixedContent)
      
      return {
        ...report,
        fixedContent,
        results: fixedReport.results
      }
    }

    return report
  }

  getAvailableRules(): LintRule[] {
    return defaultRules
  }

  getEnabledRules(): LintRule[] {
    return this.enabledRules
  }

  getRuleCounts(results: LintRuleResult[]): Map<string, number> {
    const counts = new Map<string, number>()
    
    results.forEach(result => {
      const current = counts.get(result.ruleId) || 0
      counts.set(result.ruleId, current + 1)
    })
    
    return counts
  }

  formatResults(results: LintRuleResult[]): string {
    if (results.length === 0) {
      return 'No lint issues found! ✅'
    }

    const lines: string[] = []
    const ruleCounts = this.getRuleCounts(results)
    
    lines.push(`Found ${results.length} lint issue(s):`)
    lines.push('')
    
    // Group by rule
    const groupedResults = new Map<string, LintRuleResult[]>()
    results.forEach(result => {
      const group = groupedResults.get(result.ruleId) || []
      group.push(result)
      groupedResults.set(result.ruleId, group)
    })
    
    for (const [ruleId, ruleResults] of groupedResults) {
      const rule = this.getAvailableRules().find(r => r.id === ruleId)
      const ruleName = rule ? rule.name : ruleId
      
      lines.push(`📋 ${ruleName} (${ruleResults.length} issue${ruleResults.length > 1 ? 's' : ''})`)
      
      ruleResults.forEach(result => {
        const icon = result.severity === 'error' ? '❌' : '⚠️'
        const fixable = result.fixable ? ' [fixable]' : ''
        lines.push(`  ${icon} Line ${result.line}, Column ${result.column}: ${result.message}${fixable}`)
      })
      
      lines.push('')
    }
    
    const fixableCount = results.filter(r => r.fixable).length
    if (fixableCount > 0) {
      lines.push(`💡 ${fixableCount} issue${fixableCount > 1 ? 's' : ''} can be automatically fixed`)
    }
    
    return lines.join('\n')
  }
}

// Create default singleton instance
export const lintService = new LintService()

// Export for easier testing
export { defaultRules } from './rules'