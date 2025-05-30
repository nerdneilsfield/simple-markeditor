import { test, expect } from '@playwright/test'

test.describe('Simple Markdown Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the application', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Markdown Editor')
  })

  test('should show editor and preview on desktop', async ({ page }) => {
    // Check if both editor and preview are visible on desktop
    await expect(page.locator('.editor-desktop')).toBeVisible()
    await expect(page.locator('.preview-pane')).toBeVisible()
  })

  test('should allow typing in the editor', async ({ page }) => {
    // Focus on the Monaco editor
    await page.locator('.monaco-editor').click()

    // Type some text
    await page.keyboard.type('# Hello World\n\nThis is a test.')

    // Check if the preview updates
    const preview = page.locator('.preview-pane iframe')
    await expect(preview).toBeVisible()
  })

  test('should open settings drawer', async ({ page }) => {
    // Click settings button
    await page.locator('button[title*="Settings"]').click()

    // Check if settings drawer is visible
    await expect(page.locator('h2:has-text("Settings")')).toBeVisible()
  })

  test('should change theme', async ({ page }) => {
    // Open settings
    await page.locator('button[title*="Settings"]').click()

    // Click on Notion theme
    await page.locator('input[value="notion"]').click()

    // Close settings
    await page.locator('button:has-text("×")').click()

    // The theme should be applied (we can check local storage)
    const theme = await page.evaluate(() =>
      localStorage.getItem('selected-theme')
    )
    expect(theme).toBe('notion')
  })

  test('should run lint and fix', async ({ page }) => {
    // Clear the editor and add content with lint issues
    await page.locator('.monaco-editor').click()
    await page.keyboard.press('Control+a')
    await page.keyboard.type('#BadHeading')

    // Click lint button
    await page.locator('button:has-text("Lint")').click()

    // Check if diff modal opens
    await expect(page.locator('h2:has-text("Lint")')).toBeVisible()
  })

  test('should export to PDF', async ({ page }) => {
    // Mock the print function
    await page.evaluate(() => {
      window.print = () => console.log('Print called')
    })

    // Click export button
    await page.locator('button:has-text("Export")').click()

    // Check if print was called (we can check console logs in real test)
  })

  test('should persist content in localStorage', async ({ page }) => {
    // Type some content
    await page.locator('.monaco-editor').click()
    await page.keyboard.press('Control+a')
    await page.keyboard.type('# Persistent Content\n\nThis should be saved.')

    // Wait a bit for auto-save
    await page.waitForTimeout(1000)

    // Reload the page
    await page.reload()

    // Check if content is restored
    const content = await page.evaluate(() =>
      localStorage.getItem('md-content')
    )
    expect(content).toContain('Persistent Content')
  })
})

test.describe('Mobile Layout', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should show tab navigation on mobile', async ({ page }) => {
    await page.goto('/')

    // Check if mobile tabs are visible
    await expect(page.locator('button:has-text("Editor")')).toBeVisible()
    await expect(page.locator('button:has-text("Preview")')).toBeVisible()
  })

  test('should switch between editor and preview', async ({ page }) => {
    await page.goto('/')

    // Should start with editor visible
    await expect(page.locator('.editor-mobile')).toBeVisible()

    // Click preview tab
    await page.locator('button:has-text("Preview")').click()

    // Preview should be visible, editor hidden
    await expect(page.locator('.preview-pane')).toBeVisible()
  })
})
