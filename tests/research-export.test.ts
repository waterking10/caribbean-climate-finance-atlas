import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { describe, expect, it, vi } from 'vitest'

const script = readFileSync(new URL('../tools/export-browser-research.js', import.meta.url), 'utf8')

function exportResearch(raw: string | null, denied = false) {
  const downloads: { blob?: Blob; filename?: string } = {}
  const storage = {
    getItem: vi.fn(() => {
      if (denied) throw new Error('Storage access denied')
      return raw
    }),
    setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn(),
  }
  const link = { href: '', download: '', click: vi.fn(() => { downloads.filename = link.download }), remove: vi.fn() }
  const info = vi.fn()
  const execute = () => runInNewContext(script, {
    localStorage: storage,
    location: { origin: 'https://atlas.example' },
    Blob,
    URL: {
      createObjectURL: (blob: Blob) => { downloads.blob = blob; return 'blob:local-backup' },
      revokeObjectURL: vi.fn(),
    },
    document: { createElement: () => link, body: { append: vi.fn() } },
    setTimeout: (callback: () => void) => callback(),
    console: { info },
  })
  return { execute, storage, downloads, info, link }
}

describe('private browser research backup', () => {
  it.each([
    '[{"id":"private-candidate","notes":"Exact local notes","futureField":{"value":12}}]',
    '{malformed research worth recovering',
    '[]',
    '',
    null,
  ])('downloads the exact original value without changing storage (%s)', async raw => {
    const backup = exportResearch(raw)
    backup.execute()
    expect(backup.storage.getItem).toHaveBeenCalledExactlyOnceWith('caribbean-capital-atlas.research.v1')
    const saved = JSON.parse(await backup.downloads.blob!.text())
    expect(saved).toMatchObject({
      format: 'caribbean-capital-atlas.local-research-backup.v1',
      origin: 'https://atlas.example',
      key: 'caribbean-capital-atlas.research.v1',
      present: raw !== null,
      raw,
    })
    expect(Number.isNaN(Date.parse(saved.exportedOn))).toBe(false)
    expect(backup.downloads.filename).toMatch(/^atlas-local-research-.*\.json$/)
    expect(backup.storage.setItem).not.toHaveBeenCalled()
    expect(backup.storage.removeItem).not.toHaveBeenCalled()
    expect(backup.storage.clear).not.toHaveBeenCalled()
  })

  it('stops when storage is inaccessible without producing a misleading empty backup', () => {
    const backup = exportResearch(null, true)
    expect(backup.execute).toThrow('Storage access denied')
    expect(backup.downloads.blob).toBeUndefined()
    expect(backup.link.click).not.toHaveBeenCalled()
    expect(backup.info).not.toHaveBeenCalled()
  })
})
