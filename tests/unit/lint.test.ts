import { describe, it, expect } from 'vitest'
import { LintService } from '../../src/lint/lintService'
import {
  headingSpaceRule,
  fenceCloseRule,
  boldSpacingRule,
} from '../../src/lint/rules'

describe('Lint Service', () => {
  const lintService = new LintService()

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

  describe('boldSpacingRule', () => {
    it('should detect bold text without spaces', () => {
      const content = 'This is**bold**text'
      const results = boldSpacingRule.check(content)

      expect(results).toHaveLength(1)
      expect(results[0].message).toContain('Bold text should have spaces before and after')
      expect(results[0].line).toBe(1)
      expect(results[0].fixable).toBe(true)
    })

    it('should not flag bold text with spaces', () => {
      const content = 'This is **bold** text'
      const results = boldSpacingRule.check(content)

      expect(results).toHaveLength(0)
    })

    it('should fix bold text without spaces', () => {
      const content = 'This is**bold**text'
      const results = boldSpacingRule.check(content)
      const fixed = boldSpacingRule.fix!(content, results)

      expect(fixed).toBe('This is **bold** text')
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
      const content =
        '#BadHeading\nThis is a * character\n```js\nconsole.log("unclosed")'
      const report = await lintService.lint(content)

      expect(report.results.length).toBeGreaterThan(0)
      expect(report.hasErrors).toBe(true)
    })

    it('should apply fixes correctly', async () => {
      const content = '#BadHeading\nThis is**bold**text'
      const report = await lintService.lintWithFixes(content)

      expect(report.fixedContent).toBe('# BadHeading\nThis is **bold** text')
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
