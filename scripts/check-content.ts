/**
 * Contentcontrole: valideert alle JSON-inhoud en schrijft docs/toetsmatrijs-dekking.md.
 * Gebruik: npm run check:content   (exit-code 1 bij fouten)
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkContent } from '../src/lib/contentCheck'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = join(root, 'src', 'content')
const curriculum = JSON.parse(readFileSync(join(contentDir, 'curriculum.json'), 'utf8'))
const modDir = join(contentDir, 'modules')
const modules = readdirSync(modDir)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .map((f) => {
    try {
      return { file: `modules/${f}`, data: JSON.parse(readFileSync(join(modDir, f), 'utf8')) }
    } catch (e) {
      return { file: `modules/${f}`, data: { __parseError: String(e) } }
    }
  })

const r = checkContent(curriculum, modules)
const errors = r.issues.filter((i) => i.level === 'fout')
const warnings = r.issues.filter((i) => i.level === 'waarschuwing')

const lines: string[] = []
lines.push('# Toetsmatrijs-dekking', '')
lines.push(`_Automatisch gegenereerd door \`npm run check:content\` op ${new Date().toISOString().slice(0, 10)}. Niet met de hand bewerken._`, '')
lines.push('## Status toetsmatrijs', '')
lines.push(`- Matrix: ${curriculum.matrix.name}`)
lines.push(`- Status: **${curriculum.matrix.status}**`)
lines.push(`- Officiële examentermen ingelezen: **${r.termsTotal}**`)
lines.push(`- Examengroepen met aantallen: **${r.examGroupsTotal}** (som ${r.examGroupsSum} van ${curriculum.exam.totalQuestions})`)
if (r.termsTotal > 0) {
  lines.push(`- Termen zonder les: ${r.termsWithoutLesson.length ? r.termsWithoutLesson.join(', ') : 'geen'}`)
  lines.push(`- Termen zonder vragen: ${r.termsWithoutQuestions.length ? r.termsWithoutQuestions.join(', ') : 'geen'}`)
} else {
  lines.push('- Dekking per examenterm kan pas worden berekend als de termen uit de PHB-toetsmatrijs in `src/content/curriculum.json` staan.')
}
lines.push('', '## Inhoud per module', '')
lines.push('| Module | Lessen (goedgekeurd) | Vragen (goedgekeurd) | Examengeschikt goedgekeurd | Examengeschikt concept |')
lines.push('|---|---|---|---|---|')
for (const m of r.modules) {
  lines.push(`| ${m.moduleId.replace('m0', '').replace('m', '')}. ${m.title} | ${m.lessons} (${m.lessonsApproved}) | ${m.questions} (${m.questionsApproved}) | ${m.examEligibleApproved} | ${m.examEligibleConcept} |`)
}
const tot = r.modules.reduce((a, m) => ({ l: a.l + m.lessons, q: a.q + m.questions, qa: a.qa + m.questionsApproved, ea: a.ea + m.examEligibleApproved, ec: a.ec + m.examEligibleConcept }), { l: 0, q: 0, qa: 0, ea: 0, ec: 0 })
lines.push(`| **Totaal** | **${tot.l}** | **${tot.q} (${tot.qa})** | **${tot.ea}** | **${tot.ec}** |`)
lines.push('', '## Meldingen', '')
if (r.issues.length === 0) lines.push('Geen meldingen.')
for (const i of r.issues) lines.push(`- **${i.level}** — ${i.where}: ${i.message}`)
writeFileSync(join(root, 'docs', 'toetsmatrijs-dekking.md'), lines.join('\n') + '\n')

// ---------- TODO_JURIDISCHE_REVIEW.md ----------
type Item = { kind: string; id: string; title: string; status: string; note?: string; verify: string[] }
const items: Record<string, Item[]> = {}
const fmt = (r: { law: string; article?: string }) => [r.article, r.law].filter(Boolean).join(' ')
for (const m of modules) {
  const d = m.data as { moduleId?: string; lessons?: any[]; questions?: any[]; glossary?: any[] }
  const mid = d.moduleId ?? '?'
  const push = (it: Item) => (items[mid] ??= []).push(it)
  for (const l of d.lessons ?? []) {
    const refs = [...(l.sourceRefs ?? []), ...(l.screens ?? []).filter((x: any) => x.type === 'law').map((x: any) => x.ref)]
    push({ kind: 'Les', id: l.id, title: l.title, status: l.reviewStatus, note: l.reviewNote, verify: [...new Set(refs.filter((r: any) => r?.verify).map(fmt))] as string[] })
  }
  for (const q of d.questions ?? []) {
    const v = (q.sourceRefs ?? []).filter((r: any) => r.verify).map(fmt)
    if (q.reviewNote || v.length || q.reviewStatus === 'juridische_review_nodig') push({ kind: 'Vraag', id: q.id, title: q.prompt, status: q.reviewStatus, note: q.reviewNote, verify: v })
  }
  for (const g of d.glossary ?? []) {
    const v = (g.sourceRefs ?? []).filter((r: any) => r.verify).map(fmt)
    if (v.length) push({ kind: 'Begrip', id: g.term, title: g.term, status: g.reviewStatus, verify: v })
  }
}
const t: string[] = []
t.push('# TODO juridische review', '')
t.push(`_Automatisch bijgewerkt door \`npm run check:content\` op ${new Date().toISOString().slice(0, 10)}. Wijzig de inhoud in src/content/modules/*.json; dit bestand wordt dan opnieuw opgebouwd._`, '')
t.push('## Algemeen (geldt voor alles)', '')
t.push('- [ ] **Bronnen-ZIP ontbrak bij de bouw.** PHB-toetsmatrijs v1.2, de vier PowerPoints, Oefentoets H1–H3 en de onderwerpen-png zijn niet gebruikt. Alle leerinhoud is nieuw geschreven op basis van de wet en staat op `concept` of `juridische_review_nodig`.')
t.push('- [ ] Officiële examentermen 1.1.1 t/m 5.8.1 (omschrijving, K/B/T, bronpagina) en de aantallen per groep invullen in `src/content/curriculum.json`; daarna lessen en vragen koppelen via `termIds`.')
t.push('- [ ] Examenvoorwaarden (50 vragen, 90 minuten, cesuur 70%) verifiëren aan de matrix.')
t.push('- [ ] De 33 bestaande oefenvragen (Oefentoets H1: 13, H2: 8, H3: 12) importeren, per vraag controleren en `origin` vullen.')
t.push('- [ ] Per les en vraag juridisch controleren en daarna `reviewStatus: goedgekeurd` zetten (zie docs/CONTENT_HANDLEIDING.md). Pas dan telt een vraag mee voor het officiële proefexamen.')
t.push('- [ ] Per gemeente: APV-artikelnummers in module 4 zijn die van de Model-APV en kunnen afwijken.', '')
t.push('## Specifieke reviewpunten per module', '')
for (const mod of curriculum.modules) {
  const list = (items[mod.id] ?? []).filter((i) => i.note || i.verify.length || i.status === 'juridische_review_nodig')
  t.push(`### Module ${mod.number} – ${mod.title}`, '')
  if (!list.length) t.push('Geen specifieke punten gemarkeerd (wel algemene review nodig).', '')
  for (const i of list) {
    t.push(`- [ ] **${i.kind} \`${i.id}\`** — ${i.title}`)
    if (i.note) t.push(`  - Reviewpunt: ${i.note}`)
    if (i.verify.length) t.push(`  - Te controleren bron: ${i.verify.join('; ')}`)
  }
  t.push('')
}
writeFileSync(join(root, 'TODO_JURIDISCHE_REVIEW.md'), t.join('\n'))

console.log(`Modules: ${r.modules.map((m) => `${m.moduleId}:${m.lessons}L/${m.questions}V`).join(' ')}`)
console.log(`Totaal: ${tot.l} lessen, ${tot.q} vragen (${tot.qa} goedgekeurd), ${tot.ec} examengeschikte conceptvragen`)
for (const i of errors) console.error(`FOUT ${i.where}: ${i.message}`)
console.log(`${errors.length} fouten, ${warnings.length} waarschuwingen. Rapport: docs/toetsmatrijs-dekking.md`)
process.exit(errors.length ? 1 : 0)
