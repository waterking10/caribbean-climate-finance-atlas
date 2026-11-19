import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

test('downloads a private local backup without changing the original research value', async ({ page }, testInfo) => {
  const key = 'caribbean-capital-atlas.research.v1'
  const raw = '[{"id":"local-export-fixture","notes":"Preserve exactly","unknownField":12}]'
  await page.goto('/#about')
  await expect(page.getByRole('heading', { name: 'Methodology', exact: true })).toBeVisible()
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key, raw })
  const pendingDownload = page.waitForEvent('download')
  await page.addScriptTag({ content: readFileSync('tools/export-browser-research.js', 'utf8') })
  const download = await pendingDownload
  const path = testInfo.outputPath('local-research-backup.json')
  await download.saveAs(path)
  expect(download.suggestedFilename()).toMatch(/^atlas-local-research-.*\.json$/)
  expect(JSON.parse(readFileSync(path, 'utf8'))).toMatchObject({ key, raw, present: true, origin: 'http://127.0.0.1:4173' })
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(raw)
})

for (const width of [320, 390]) {
  test(`keeps all public navigation links usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    const navigation = page.getByRole('navigation', { name: 'Main navigation' })
    await expect(navigation.getByRole('link')).toHaveText(['Explore', 'Compare', 'About & Methodology'])
    const destinations = [
      ['Compare', 'Compare entities'],
      ['About & Methodology', 'Caribbean Climate & Transition Finance Atlas'],
      ['Explore', 'Network explorer'],
    ]
    for (const [label, heading] of destinations) {
      const link = navigation.getByRole('link', { name: label, exact: true })
      await expect(link).toBeVisible()
      const bounds = (await link.boundingBox())!
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
      await link.click()
      await expect(link).toHaveAttribute('aria-current', 'page')
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Suggest a correction or missing mechanism' })).toBeVisible()
    }
    await page.getByRole('button', { name: 'Switch to dark theme' }).click()
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })
}
