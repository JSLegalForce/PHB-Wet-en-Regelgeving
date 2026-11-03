/**
 * Juridische aftekening door een inhoudsdeskundige (mens). Zet lessen/vragen op `goedgekeurd`.
 *
 *   npm run review:approve -- --door "mr. A. Jansen" --ids q-m06-l01-2,q-m06-l01-3
 *   npm run review:approve -- --door "mr. A. Jansen" --module m06
 *
 * Alleen items met status `inhoudelijk_gecontroleerd` worden afgetekend; items met
 * `juridische_review_nodig`, `concept` of een bron met `verify: true` worden overgeslagen
 * en gemeld. Elke aftekening wordt toegevoegd aan documentatie/juridische_wijzigingen.csv.
 */
import { appendFileSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 ? process.argv[i + 1] : undefined
}
const door = arg('door')
const ids = new Set((arg('ids') ?? '').split(',').filter(Boolean))
const mod = arg('module')
if (!door || /\b(claude|ai)\b/i.test(door) || (!ids.size && !mod)) {
  console.error('Gebruik: npm run review:approve -- --door "<naam jurist>" (--ids id1,id2 | --module mXX). Aftekening alleen door een mens.')
  process.exit(1)
}
const today = new Date().toISOString().slice(0, 10)
const dir = join(root, 'src', 'content', 'modules')
const csv = join(root, 'documentatie', 'juridische_wijzigingen.csv')
const q = (s: string) => `"${s.replace(/"/g, '""')}"`
let ok = 0
const skipped: string[] = []
for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  const path = join(dir, f)
  const data = JSON.parse(readFileSync(path, 'utf8'))
  let changed = false
  for (const item of [...data.lessons, ...data.questions]) {
    if (!(ids.has(item.id) || (mod && item.moduleId === mod))) continue
    const refs = [...(item.sourceRefs ?? []), ...((item.screens ?? []).filter((s: any) => s.type === 'law').map((s: any) => s.ref))]
    if (item.reviewStatus !== 'inhoudelijk_gecontroleerd' || refs.some((r: any) => r.verify)) {
      skipped.push(`${item.id} (${item.reviewStatus}${refs.some((r: any) => r.verify) ? ', bron te controleren' : ''})`)
      continue
    }
    const [maj, min] = String(item.version).split('.').map(Number)
    Object.assign(item, { reviewStatus: 'goedgekeurd', reviewedBy: door, reviewedOn: today, lastModified: today, version: `${maj}.${min + 1}` })
    appendFileSync(csv, [q(`src/content/modules/${f}`), q(item.id), q('inhoudelijk_gecontroleerd'), q('goedgekeurd'), q(`juridische aftekening door ${door}`), q((item.termIds ?? []).join(' ')), q(''), q(today), q('goedgekeurd'), q(door)].join(',') + '\n')
    changed = true
    ok++
  }
  if (changed) writeFileSync(path, JSON.stringify(data, null, 2) + '\n')
}
console.log(`${ok} item(s) afgetekend door ${door}.`)
if (skipped.length) console.log(`Overgeslagen (eerst reviewpunt oplossen): ${skipped.join(', ')}`)
