import { describe, it, expect } from 'vitest'
import { LintService } from '../../src/lint/lintService'
import { escapeAsteriskRule, headingSpaceRule, fenceCloseRule } from '../../src/lint/rules'

describe('Lint Service', () => {
  const lintService = new LintService()

  describe('escapeAsteriskRule', () => {
    it('should detect unescaped asterisks', () => {
      const content = 'This is a * character that should be escaped'
      const results = escapeAsteriskRule.check(content)
      
      expect(results).toHaveLength(1)
      expect(results[0].message).toContain('Asterisk should be escaped')
      expect(results[0].line).toBe(1)
      expect(results[0].fixable).toBe(true)
    })

    it('should not flag escaped asterisks', () => {
      const content = 'This is an \\* escaped asterisk'
      const results = escapeAsteriskRule.check(content)
      
      expect(results).toHaveLength(0)
    })

    it('should not flag emphasis asterisks', () => {
      const content = 'This is *italic* text with **bold** text'
      const results = escapeAsteriskRule.check(content)
      
      expect(results).toHaveLength(0)
    })

    it('should fix unescaped asterisks', () => {
      const content = 'This is a * character'
      const results = escapeAsteriskRule.check(content)
      const fixed = escapeAsteriskRule.fix!(content, results)
      
      expect(fixed).toBe('This is a \\* character')
    })
  })

  describe('headingSpaceRule', () => {
    it('should detect headings without space', () => {
      const content = '#Heading without space'
      const results = headingSpaceRule.check(content)
      
      expect(results).toHaveLength(1)
      expect(results[0].message).toContain('followed by a space')
      expect(results[0].fixable).toBe(true)
    })

    it('should not flag proper headings', () => {
      const content = '# Proper heading'
      const results = headingSpaceRule.check(content)
      
      expect(results).toHaveLength(0)
    })

    it('should fix headings without space', () => {
      const content = '#Heading\n##Another'
      const results = headingSpaceRule.check(content)
      const fixed = headingSpaceRule.fix!(content, results)
      
      expect(fixed).toBe('# Heading\n## Another')
    })
  })

  describe('fenceCloseRule', () => {
    it('should detect unclosed code blocks', () => {
      const content = '```javascript\nconsole.log("hello")'
      const results = fenceCloseRule.check(content)
      
      expect(results).toHaveLength(1)
      expect(results[0].message).toContain('not properly closed')
      expect(results[0].fixable).toBe(true)
    })

    it('should not flag properly closed code blocks', () => {
      const content = '```javascript\nconsole.log("hello")\n```'
      const results = fenceCloseRule.check(content)
      
      expect(results).toHaveLength(0)
    })

    it('should fix unclosed code blocks', () => {
      const content = '```javascript\nconsole.log("hello")'
      const results = fenceCloseRule.check(content)
      const fixed = fenceCloseRule.fix!(content, results)
      
      expect(fixed).toBe('```javascript\nconsole.log("hello")\n\n```')
    })
  })

  describe('LintService integration', () => {
    it('should run all enabled rules', async () => {
      const content = '#BadHeading\nThis is a * character\n```js\nconsole.log("unclosed")'
      const report = await lintService.lint(content)
      
      expect(report.results.length).toBeGreaterThan(0)
      expect(report.hasErrors).toBe(true)
    })

    it('should apply fixes correctly', async () => {
      const content = '#BadHeading\nThis is a * character'
      const report = await lintService.lintWithFixes(content)
      
      expect(report.fixedContent).toBe('# BadHeading\nThis is a \\* character')
    })

    it('should format results properly', async () => {
      const content = '#BadHeading'
      const report = await lintService.lint(content)
      const formatted = lintService.formatResults(report.results)
      
      expect(formatted).toContain('Found')
      expect(formatted).toContain('issue')
    })
  })
})