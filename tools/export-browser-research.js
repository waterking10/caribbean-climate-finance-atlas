// Run in the browser console on the ORIGINAL atlas origin and browser profile.
// Local download only: no network requests, storage writes, parsing or merging.
(() => {
  const key = 'caribbean-capital-atlas.research.v1'
  const raw = localStorage.getItem(key) // Stop if access fails; never report failure as an empty queue.
  const exportedOn = new Date().toISOString()
  const backup = {
    format: 'caribbean-capital-atlas.local-research-backup.v1',
    origin: location.origin,
    exportedOn,
    key,
    present: raw !== null,
    raw, // Preserve the exact value, including unknown fields or malformed JSON.
  }
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'atlas-local-research-' + exportedOn.replace(/[:.]/g, '-') + '.json'
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  console.info(raw === null ? 'Backup downloaded: no saved research value on this origin.' : 'Research backup downloaded. Verify the file before retiring the desk.')
})()
