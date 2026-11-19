import { expect, test } from '@playwright/test'
import { join } from 'node:path'
import { readFileSync, readdirSync } from 'node:fs'

test('excludes candidate queues and management functions from the public production bundle', () => {
  const scripts = readdirSync('dist/assets').filter(file => file.endsWith('.js'))
  expect(scripts.length).toBeGreaterThan(0)
  const bundle = scripts.map(file => readFileSync(join('dist/assets', file), 'utf8')).join('\n')
  for (const privateContent of ['caribbean-capital-atlas.research.v1', 'candidate-nrstor-caribbean',
    'Candidate added to the review queue.', 'Approval requires a source URL', 'Filter review queue']) {
    expect(bundle).not.toContain(privateContent)
  }
})

test('renders the focused canvas and preserves graph selection through full profile evidence', async ({page}) => {
  const errors:string[]=[]
  page.on('pageerror',error=>errors.push(error.message))
  await page.goto('/')
  const graph=page.getByTestId('focused-graph')
  await expect(graph.locator('canvas').first()).toBeVisible()
  await page.getByRole('list',{name:'Visible institutions'}).getByRole('button',{name:'CDB Development bank',exact:true}).click()
  const panel=page.getByRole('complementary',{name:'Institution summary'})
  await expect(panel.getByRole('heading',{name:'Caribbean Development Bank',exact:true})).toBeVisible()
  await expect(panel.getByText('Research limitations and unresolved questions')).toHaveCount(0)
  await panel.getByRole('link',{name:'See full profile'}).click()
  await expect(page).toHaveURL(/#institution\/cdb$/)
  await expect(page.getByRole('link',{name:'Official website'})).toHaveAttribute('href','https://www.caribank.org/')
  await expect(page.getByRole('heading',{name:'Supporting sources',exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Back to network',exact:true}).click()
  await expect(panel.getByRole('heading',{name:'Caribbean Development Bank',exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Zoom in',exact:true}).click()
  await page.getByRole('button',{name:'Zoom out',exact:true}).click()
  await page.getByRole('button',{name:'Fit network',exact:true}).click()
  const bounds=(await graph.boundingBox())!
  await page.mouse.move(bounds.x+15,bounds.y+15)
  await page.mouse.down();await page.mouse.move(bounds.x+40,bounds.y+35,{steps:8});await page.mouse.up()
  await graph.click({position:{x:8,y:8}})
  await expect(page.getByRole('complementary',{name:'Selection summary'})).toBeVisible()
  expect(errors).toEqual([])
})

test('searches aliases and compares institutions and mechanisms',async({page})=>{
  await page.goto('/')
  const search=page.getByRole('searchbox',{name:'Search institutions, funds and mechanisms'})
  await search.fill('FirstCaribbean')
  await page.getByRole('region',{name:'Search results'}).getByRole('button').filter({hasText:'CIBC Caribbean Bank Limited'}).click()
  await expect(page.getByRole('complementary',{name:'Institution summary'}).getByRole('heading',{name:'CIBC Caribbean Bank Limited'})).toBeVisible()
  await page.getByRole('complementary',{name:'Institution summary'}).getByRole('button',{name:'Compare',exact:true}).click()
  await page.getByRole('navigation').getByRole('link',{name:/Compare/}).click()
  const chooser=page.getByLabel('Add entity to comparison')
  await chooser.selectOption('idb');await chooser.selectOption('energy-smart-ii')
  const table=page.getByRole('table')
  await expect(table.getByRole('button',{name:'Inter-American Development Bank'})).toBeVisible()
  await expect(table.getByRole('button',{name:'Barbados Energy Smart Fund II'})).toBeVisible()
  await expect(table.getByRole('row',{name:/Financial roles/})).toContainText('Capital provider')
  await page.getByRole('button',{name:'Remove IDB',exact:true}).click()
  await expect(table.getByRole('button',{name:'Inter-American Development Bank'})).toHaveCount(0)
})

test('shows only public navigation and leaves private local research untouched', async ({ page }) => {
  const key = 'caribbean-capital-atlas.research.v1'
  const raw = JSON.stringify([{ id: 'private-fixture', name: 'Private candidate fixture', notes: 'Private review fixture' }])
  await page.addInitScript(({ key, raw }) => {
    localStorage.setItem(key, raw)
    const original = Storage.prototype.getItem
    Storage.prototype.getItem = function (name) {
      if (name === key) throw new Error('Public app must not read private research')
      return original.call(this, name)
    }
  }, { key, raw })
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/#research')
  const navigation = page.getByRole('navigation', { name: 'Main navigation' })
  await expect(navigation.getByRole('link')).toHaveText(['Explore', 'Compare', 'About & Methodology'])
  await expect(navigation.getByRole('link', { name: 'Explore', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(page).toHaveURL(/#network$/)
  for (const name of ['Explore', 'Compare', 'About & Methodology']) {
    await navigation.getByRole('link', { name, exact: true }).click()
    await expect(navigation.getByRole('link', { name, exact: true })).toHaveAttribute('aria-current', 'page')
    await expect(page.getByText('Private candidate fixture')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /Add candidate|Save review/ })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Research desk', exact: true })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Suggest a correction or missing mechanism' })).toHaveAttribute('href',
      'https://github.com/waterking10/caribbean-climate-finance-atlas/issues/new?template=correction-or-missing-mechanism.yml')
  }
  await expect(page.getByRole('heading', { name: 'Methodology', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Limitations', exact: true })).toBeVisible()
  // Own property reads verify the exact stored value without the guarded getItem.
  expect(await page.evaluate(key => localStorage[key], key)).toBe(raw)
  expect(errors).toEqual([])
})

for (const route of ['#research', '#research-desk', '#/research', '#/research-desk/']) {
  test(`retired ${route} bookmark resolves to Explore on load and during navigation`, async ({ page }) => {
    await page.goto('/' + route)
    await expect(page).toHaveURL(/#network$/)
    await expect(page.getByRole('heading', { name: 'Network explorer' })).toBeVisible()
    await page.getByRole('navigation').getByRole('link', { name: 'Compare', exact: true }).click()
    await page.evaluate(route => { window.location.hash = route }, route)
    await expect(page).toHaveURL(/#network$/)
    await expect(page.getByRole('heading', { name: 'Network explorer' })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Network explorer' })).toBeVisible()
  })
}

test('ignores malformed browser-local research on retired routes', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('caribbean-capital-atlas.research.v1', '{unparsed local research'))
  await page.goto('/#research')
  await expect(page.getByRole('heading', { name: 'Network explorer' })).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('caribbean-capital-atlas.research.v1'))).toBe('{unparsed local research')
})

test('switches theme and uses primary and advanced filters on a narrow screen',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/')
  await page.getByRole('button',{name:'Switch to dark theme'}).click()
  await page.getByLabel('Relationship type',{exact:true}).selectOption('capital')
  await page.getByText('Advanced filters',{exact:true}).click()
  await expect(page.getByLabel('Financing instrument',{exact:true})).toBeVisible()
  await page.getByLabel('Geography',{exact:true}).selectOption('jamaica')
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.getByRole('link',{name:'About & Methodology',exact:true}).click()
  await expect(page.getByRole('heading',{name:'Methodology',exact:true})).toBeVisible()
  await page.getByRole('link',{name:'Explore the network',exact:true}).click()
  await expect(page.getByLabel('Geography',{exact:true})).toHaveValue('jamaica')
  await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','dark')
})

test('loads production assets and routes under a Pages repository path', async ({ page }) => {
  const mount = 'https://atlas.example/caribbean-capital-atlas/'
  await page.route(mount + '**', route => {
    const path = new URL(route.request().url()).pathname.slice('/caribbean-capital-atlas/'.length)
    return route.fulfill({ path: join('dist', path || 'index.html') })
  })
  await page.goto(mount)
  await expect(page.getByRole('heading', { name: 'Network explorer' })).toBeVisible()
  await page.getByRole('link', { name: 'About & Methodology', exact: true }).click()
  await expect(page).toHaveURL(mount + '#about')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Caribbean Climate & Transition Finance Atlas' })).toBeVisible()
  await page.goto(mount + '#mechanism/surge')
  await expect(page.getByRole('heading', { name: 'Full documented pathway', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Decision-making authorities', exact: true })).toBeVisible()
  await page.goto(mount + '#research')
  await expect(page).toHaveURL(mount + '#network')
  await expect(page.getByRole('heading', { name: 'Network explorer' })).toBeVisible()
})

test('keeps mechanisms off the starting canvas and makes the wider research searchable',async({page})=>{
  await page.goto('/')
  const nodes=page.getByRole('list',{name:'Visible institutions'}).getByRole('button')
  await expect(nodes).toHaveCount(69)
  await expect(nodes.filter({hasText:'Energy Smart II'})).toHaveCount(0)
  await expect(page.getByRole('button',{name:/Explore pathways|Explore institutions|Explore ecosystem|Full network/})).toHaveCount(0)
  await page.getByRole('searchbox').fill('PPP Support Facility')
  await page.getByRole('region',{name:'Search results'}).getByRole('button').filter({hasText:'Regional Public-Private Partnership Support Facility'}).click()
  await expect(page.getByRole('complementary',{name:'Institution summary'}).getByRole('heading',{name:'Regional Public-Private Partnership Support Facility'})).toBeVisible()
})

test('finds a published mechanism and identifies guarantee coverage',async({page})=>{
  await page.goto('/')
  await page.getByRole('searchbox').fill('Barbados Blue Loan')
  await page.getByRole('region',{name:'Search results'}).getByRole('button').filter({hasText:'Barbados Blue Loan for Marine Conservation'}).click()
  await expect(page.getByRole('complementary',{name:'Arrangement summary'})).toBeVisible()
  await page.getByRole('region',{name:'Climate finance network'}).getByText(/^Connections in this view/).click()
  await page.getByRole('list',{name:'Documented connections'}).getByRole('button').filter({hasText:'TNC → Barbados Blue Loan'}).click()
  const connection=page.getByRole('complementary',{name:'Connection summary'})
  await expect(connection).toContainText('contingent protection')
  await expect(connection).toContainText('USD 50,000,000')
  await expect(connection).toContainText('Guarantee coverage')
})

test('preserves guarantee beneficiaries, separate authority and unknowns in full mechanism evidence',async({page})=>{
  await page.goto('/#mechanism/barbados-blue-loan')
  await expect(page.getByRole('heading',{name:'Decision-making authorities',exact:true})).toBeVisible()
  const protectedParties=page.getByText(/^Protected parties: BB Blue Financing Company DAC/)
  await expect(protectedParties).toHaveCount(2)
  for(const item of await protectedParties.all())await expect(item).toContainText('FirstCaribbean International Bank (Barbados) Limited')
  await expect(page.getByRole('heading',{name:'Guarantees and risk sharing',exact:true})).toBeVisible()
  await expect(page.getByText('Guarantee coverage · Closed').first()).toBeVisible()
  const research=page.getByRole('region',{name:'Capital pathway research'})
  await research.getByText(/Open research questions/).click()
  await expect(research.getByText('Credit approval and disbursement authority · Unknown', {exact:true})).toBeVisible()
  await expect(page.getByRole('link',{name:'Barbados Environmental Sustainability Fund Inc. By-Law No. 1',exact:false}).first()).toHaveAttribute('href',/BESF-By-laws\.pdf/)
})

test('preserves EDC institution-wide capital scope and source evidence in full profiles',async({page})=>{
  await page.goto('/#institution/edc')
  await expect(page.getByRole('heading',{name:'Export Development Canada',exact:true})).toBeVisible()
  await expect(page.getByRole('heading',{name:'Financial observations',exact:true})).toBeVisible()
  await expect(page.getByText('CAD 350,000,000',{exact:true}).first()).toBeVisible()
  await expect(page.getByText(/Institution balance sheet/).first()).toBeVisible()
  await page.getByRole('link',{name:/Enertur solar financing and FinDev institutional funding context/}).first().click()
  await expect(page.getByText(/No allocation of a particular EDC advance/).first()).toBeVisible()
})

test('preserves alternative CBF observations, dates and unresolved scope in the full pathway',async({page})=>{
  await page.goto('/#institution/cbf-eba')
  await page.getByRole('link',{name:/German IKI capital supporting CBF ecosystem-based adaptation/}).first().click()
  await expect(page.getByText('EUR 55,000,000',{exact:true}).first()).toBeVisible()
  await expect(page.getByText('EUR 55,880,000',{exact:true}).first()).toBeVisible()
  const research=page.getByRole('region',{name:'Capital pathway research'})
  await research.getByText('Reported amounts',{exact:true}).click()
  await expect(research.getByText('Reporting date unknown',{exact:true}).first()).toBeVisible()
  await expect(research.getByText('Source inspected · 2026-11-18',{exact:true}).first()).toBeVisible()
  await research.getByText(/Open research questions/).click()
  await expect(research.getByText('Programme funding scope across disclosures · Conflicting',{exact:true})).toBeVisible()
})

