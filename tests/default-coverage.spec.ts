import { expect, test } from '@playwright/test'
import type { Core } from 'cytoscape'

for (const width of [1440, 390]) {
  const size = width === 1440 ? 'desktop' : 'mobile'
  test(`${size}: fits all documented institutions and preserves mechanism-only exploration and filtering`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/')
    const chart = page.getByRole('region', { name: 'Climate finance network' })
    await expect(chart.getByText('69 institutions · 49 connections', { exact: true })).toBeVisible()
    const canvas = page.getByTestId('focused-graph')
    // Inspect Cytoscape's existing container registration; no production debug API.
    const geometry = await canvas.evaluate(host => {
      const cy = (host as HTMLElement & { _cyreg: { cy: Core } })._cyreg.cy
      return { width: cy.width(), height: cy.height(), zoom: cy.zoom(), pan: cy.pan(),
        nodes: cy.nodes().map(node => ({ id: node.id(), ...node.renderedPosition(), degree: node.degree() })),
        edges: cy.edges().length }
    })
    expect(geometry.nodes).toHaveLength(69)
    expect(geometry.edges).toBe(49)
    expect(geometry.nodes.filter(node => node.degree === 0)).toHaveLength(23)
    for (const node of geometry.nodes) {
      expect(node.x, node.id + ' fits horizontally').toBeGreaterThanOrEqual(3)
      expect(node.x, node.id + ' fits horizontally').toBeLessThanOrEqual(geometry.width - 3)
      expect(node.y, node.id + ' fits vertically').toBeGreaterThanOrEqual(3)
      expect(node.y, node.id + ' fits vertically').toBeLessThanOrEqual(geometry.height - 3)
    }
    for (const id of ['energy-smart-ii', 'surge', 'barbados-blue-loan']) expect(geometry.nodes.some(node => node.id === id)).toBe(false)
    await page.screenshot({ path: `design/default-coverage/default-${size}.png`, fullPage: true })
    if (width === 390) await page.getByRole('button', { name: 'Show institutions', exact: true }).click()
    const institutions = page.getByRole('list', { name: 'Visible institutions' }).getByRole('button')
    await expect(institutions).toHaveCount(69)
    await institutions.filter({ hasText: 'Searious Business BV' }).click()
    const panel = page.getByRole('complementary', { name: 'Institution summary' })
    await expect(panel.getByRole('heading', { name: 'Searious Business BV', exact: true })).toBeVisible()
    await expect(panel).toContainText('No direct institutional connection matches this view')
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: `design/default-coverage/mechanism-only-${size}.png`, fullPage: true })
    await panel.getByRole('button', { name: 'Advancing Circular Economy Facility', exact: true }).click()
    const arrangement = page.getByRole('complementary', { name: 'Arrangement summary' })
    await arrangement.getByRole('button', { name: 'Expand arrangement', exact: true }).click()
    await expect(chart.getByRole('button', { name: 'Back to network', exact: true })).toBeVisible()
    await arrangement.getByRole('link', { name: 'See full pathway', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Supporting sources', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Back to network', exact: true }).click()
    await chart.getByRole('button', { name: 'Back to network', exact: true }).click()
    await expect(chart.getByText('69 institutions · 49 connections', { exact: true })).toBeVisible()
    await expect(arrangement.getByRole('button', { name: 'Expand arrangement', exact: true })).toBeVisible()
    const restored = await canvas.evaluate(host => {
      const cy = (host as HTMLElement & { _cyreg: { cy: Core } })._cyreg.cy
      return { zoom: cy.zoom(), pan: cy.pan(), ids: cy.nodes().map(node => node.id()), selected: cy.nodes('.chosen').map(node => node.id()) }
    })
    expect(restored.zoom).toBeCloseTo(geometry.zoom)
    expect(restored.pan.x).toBeCloseTo(geometry.pan.x)
    expect(restored.pan.y).toBeCloseTo(geometry.pan.y)
    expect(restored.ids.sort()).toEqual(geometry.nodes.map(node => node.id).sort())
    expect(restored.selected).toEqual(['searious-business'])
    await page.getByLabel('Relationship type', { exact: true }).selectOption('capital')
    await page.getByLabel('Geography', { exact: true }).selectOption('barbados')
    await page.getByLabel('Financing theme', { exact: true }).selectOption('energy_transition')
    await page.getByText('Advanced filters', { exact: true }).click()
    await page.getByLabel('Institution type', { exact: true }).selectOption('development_finance')
    await page.getByLabel('Ownership', { exact: true }).selectOption('Multilateral')
    await page.getByLabel('Financing instrument', { exact: true }).selectOption('loan')
    await expect(chart).not.toContainText('No matching connections')
    const filtered = await canvas.evaluate(host => {
      const cy = (host as HTMLElement & { _cyreg: { cy: Core } })._cyreg.cy
      return { nodes: cy.nodes().length, isolates: cy.nodes().filter(node => node.degree() === 0).length,
        capitalOnly: cy.edges().map(edge => edge.hasClass('capital')).every(Boolean) }
    })
    expect(filtered.nodes).toBeGreaterThan(0)
    expect(filtered.nodes).toBeLessThan(69)
    expect(filtered.isolates).toBe(0)
    expect(filtered.capitalOnly).toBe(true)
    await page.getByRole('button', { name: 'Reset filters', exact: true }).click()
    await expect(chart.getByText('69 institutions · 49 connections', { exact: true })).toBeVisible()
    expect(await canvas.evaluate(host => {
      const cy = (host as HTMLElement & { _cyreg: { cy: Core } })._cyreg.cy
      return cy.nodes().map(node => node.renderedPosition()).every(point => point.x >= 3 && point.x <= cy.width() - 3 && point.y >= 3 && point.y <= cy.height() - 3)
    })).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    expect(errors).toEqual([])
  })
}
