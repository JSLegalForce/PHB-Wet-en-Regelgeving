/**
 * Contentcontrole: valideert alle JSON-inhoud en schrijft
 *  - documentatie/toetsmatrijs-dekking.md (traceerbare dekking per toetsterm, examengroep en verplicht onderdeel)
 *  - TODO_JURIDISCHE_REVIEW.md (alle open juridische reviewpunten)
 * Gebruik: npm run check:content   (exit-code 1 bij fouten)
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
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

const r = checkContent(curriculum, modules, (p) => existsSync(join(root, 'public', p)))
const errors = r.issues.filter((i) => i.level === 'fout')
const warnings = r.issues.filter((i) => i.level === 'waarschuwing')
const today = curriculum.peildatum
const icon = { volledig: '✅', review: '⚠️', ontbreekt: '❌' } as const

const lines: string[] = []
lines.push('# Toetsmatrijs-dekking', '')
lines.push(`_Automatisch gegenereerd door \`npm run check:content\`. Juridische peildatum: ${today}. Niet met de hand bewerken._`, '')
lines.push('## Bron', '')
lines.push(`- Matrix: ${curriculum.matrix.name}`)
if (curriculum.matrix.url) lines.push(`- Vindplaats: ${curriculum.matrix.url} (geraadpleegd ${curriculum.matrix.retrieved})`)
lines.push(`- Status: **${curriculum.matrix.status}** — ${r.termsTotal} toetstermen, ${r.examGroupsTotal} examengroepen, som quota **${r.examGroupsSum}** van ${curriculum.exam.totalQuestions}`)
lines.push(`- Examen: ${curriculum.exam.source}`)
lines.push(`- ${curriculum.matrix.note}`, '')
lines.push('## Legenda', '')
lines.push('- ✅ volledig: les en ≥ 1 meerkeuzevraag op het matrixniveau zijn inhoudelijk tegen de geldende wettekst gecontroleerd (of door een jurist goedgekeurd)')
lines.push('- ⚠️ review: les en vragen aanwezig, maar (een deel) wacht op juridische review')
lines.push('- ❌ ontbreekt: geen les of geen passende meerkeuzevraag')
lines.push('- G = goedgekeurd door jurist · C = inhoudelijk gecontroleerd (AI-controle tegen wettekst, wacht op aftekening) · R = juridische review nodig · K = concept', '')
lines.push('## Per toetsterm', '')
lines.push('| Term | Begrip | Tax. | Groep (quotum) | Lessen | MC-vragen G/C/R/K | Status |')
lines.push('|---|---|---|---|---|---|---|')
for (const t of r.terms) {
  const g = curriculum.examGroups.find((x: { id: string }) => x.id === t.groupId)
  lines.push(`| ${t.id} | ${t.title} | ${t.taxonomy} | ${g?.label ?? '?'} (${g?.questionCount ?? '?'}) | ${t.lessons.join(', ') || '—'} | ${t.mc.goedgekeurd}/${t.mc.inhoudelijk_gecontroleerd}/${t.mc.juridische_review_nodig}/${t.mc.concept} | ${icon[t.status]} ${t.status} |`)
}
const cnt = (s: string) => r.terms.filter((t) => t.status === s).length
lines.push('', `**Samenvatting:** ${cnt('volledig')} volledig · ${cnt('review')} review · ${cnt('ontbreekt')} ontbreekt (van ${r.termsTotal}).`, '')
lines.push('## Per examengroep (quota uit de matrix)', '')
lines.push('Streefwaarde: 3 geschikte varianten per examenvraag. "Officieel" kan pas als iedere groep ≥ quotum goedgekeurde vragen heeft.', '')
lines.push('| Groep | Termen | Quotum | Goedgekeurd | Gecontroleerd | Review | Concept | Streef (3×) | Officieel | Concept-examen |')
lines.push('|---|---|---|---|---|---|---|---|---|---|')
for (const g of r.groups) {
  const usable = g.goedgekeurd + g.gecontroleerd
  lines.push(`| ${g.label} | ${g.termIds.join(', ')} | ${g.quota} | ${g.goedgekeurd} | ${g.gecontroleerd} | ${g.review} | ${g.concept} | ${usable >= g.target ? '✅' : '⚠️'} ${usable}/${g.target} | ${g.goedgekeurd >= g.quota ? '✅' : '❌'} | ${usable >= g.quota ? '✅' : g.review + usable >= g.quota ? '⚠️ aanvulling' : '❌'} |`)
}
lines.push('', '## Verplichte onderdelen (strafbare feiten en bevoegdheden uit de matrix)', '')
lines.push('| Onderdeel | Term | Lessen | MC-vragen | Vereist | Gedekt |')
lines.push('|---|---|---|---|---|---|')
for (const m of r.mandatory) lines.push(`| ${m.label} | ${m.termId} | ${m.lessons} | ${m.questions} | ${m.required} | ${m.ok ? '✅' : '❌'} |`)
lines.push('', '## Inhoud per module', '')
lines.push('| Module | Lessen (goedgekeurd) | Vragen | Goedgekeurd | Gecontroleerd | Review | MC examengeschikt |')
lines.push('|---|---|---|---|---|---|---|')
for (const m of r.modules) lines.push(`| ${Number(m.moduleId.slice(1))}. ${m.title} | ${m.lessons} (${m.lessonsApproved}) | ${m.questions} | ${m.questionsApproved} | ${m.questionsChecked} | ${m.questionsReview} | ${m.examEligibleConcept} |`)
const tot = r.modules.reduce((a, m) => ({ l: a.l + m.lessons, q: a.q + m.questions, qa: a.qa + m.questionsApproved, qc: a.qc + m.questionsChecked, qr: a.qr + m.questionsReview, ec: a.ec + m.examEligibleConcept }), { l: 0, q: 0, qa: 0, qc: 0, qr: 0, ec: 0 })
lines.push(`| **Totaal** | **${tot.l}** | **${tot.q}** | **${tot.qa}** | **${tot.qc}** | **${tot.qr}** | **${tot.ec}** |`)
lines.push('', '## Meldingen', '')
if (r.issues.length === 0) lines.push('Geen meldingen.')
for (const i of r.issues) lines.push(`- **${i.level}** — ${i.where}: ${i.message}`)
writeFileSync(join(root, 'documentatie', 'toetsmatrijs-dekking.md'), lines.join('\n') + '\n')

// ---------- TODO_JURIDISCHE_REVIEW.md ----------
type Item = { kind: string; id: string; title: string; status: string; note?: string; verify: string[]; terms: string[] }
const items: Record<string, Item[]> = {}
const fmt = (x: { law: string; article?: string }) => [x.article, x.law].filter(Boolean).join(' ')
for (const m of modules) {
  const d = m.data as { moduleId?: string; lessons?: any[]; questions?: any[]; glossary?: any[] }
  const mid = d.moduleId ?? '?'
  const push = (it: Item) => (items[mid] ??= []).push(it)
  for (const l of d.lessons ?? []) {
    const refs = [...(l.sourceRefs ?? []), ...(l.screens ?? []).filter((x: any) => x.type === 'law').map((x: any) => x.ref)]
    push({ kind: 'Les', id: l.id, title: l.title, status: l.reviewStatus, note: l.reviewNote, verify: [...new Set(refs.filter((x: any) => x?.verify).map(fmt))] as string[], terms: l.termIds ?? [] })
  }
  for (const q of d.questions ?? []) {
    const v = (q.sourceRefs ?? []).filter((x: any) => x.verify).map(fmt)
    push({ kind: 'Vraag', id: q.id, title: q.prompt, status: q.reviewStatus, note: q.reviewNote, verify: v, terms: q.termIds ?? [] })
  }
  for (const g of d.glossary ?? []) {
    const v = (g.sourceRefs ?? []).filter((x: any) => x.verify).map(fmt)
    push({ kind: 'Begrip', id: g.term, title: g.term, status: g.reviewStatus, verify: v, terms: [] })
  }
}
const all = Object.values(items).flat()
const n = (s: string) => all.filter((i) => i.status === s).length
const t: string[] = []
t.push('# TODO juridische review', '')
t.push(`_Automatisch bijgewerkt door \`npm run check:content\` (peildatum ${today}). Wijzig de inhoud in src/content/modules/*.json; dit bestand wordt dan opnieuw opgebouwd._`, '')
t.push('## Stand van zaken', '')
t.push(`- Items totaal (lessen, vragen, begrippen): ${all.length}`)
t.push(`- Goedgekeurd door jurist: ${n('goedgekeurd')} · inhoudelijk gecontroleerd (AI, wacht op aftekening): ${n('inhoudelijk_gecontroleerd')} · juridische review nodig: ${n('juridische_review_nodig')} · concept: ${n('concept')} · afgekeurd: ${n('afgekeurd')}`, '')
t.push('## Algemeen', '')
t.push('- [ ] **Aftekening door een inhoudsdeskundige jurist.** Geen enkel item is `goedgekeurd`: dat is bewust voorbehouden aan een menselijke jurist (`npm run review:approve`, zie documentatie/CONTENT_HANDLEIDING.md). Pas daarna wordt het proefexamen volgens toetsmatrijs (officieel) vrijgegeven.')
t.push('- [ ] **Ontbrekende bronbestanden.** De PowerPoints lesdag 1/2/3, AVO H4 en Oefentoets H1–H3 (33 vragen) zijn niet aangeleverd bij de herziening van 3-11-2026 en dus niet geïmporteerd of vergeleken. Importeer ze alsnog met `origin` en controleer per vraag de antwoordsleutel.')
t.push('- [ ] **APV**: module 4 volgt de nummering van de VNG Model-APV; per gemeente kunnen nummering, inhoud en aanwijzingsbesluiten afwijken.')
t.push('- [ ] **Domeinlijst**: controleer per boa (akte, domeinlijst Domein I, aantekeningen) welke feiten en bevoegdheden daadwerkelijk zijn toegekend.', '')
t.push('## Reviewpunten per module', '')
for (const mod of curriculum.modules) {
  const list = (items[mod.id] ?? []).filter((i) => i.status === 'juridische_review_nodig' || i.status === 'concept' || i.verify.length)
  t.push(`### Module ${mod.number} – ${mod.title}`, '')
  if (!list.length) t.push('Geen open reviewpunten; alle items zijn inhoudelijk gecontroleerd (aftekening door jurist volgt).', '')
  for (const i of list) {
    t.push(`- [ ] **${i.kind} \`${i.id}\`**${i.terms.length ? ` (term ${i.terms.join(', ')})` : ''} — ${i.title}`)
    t.push(`  - Status: ${i.status}`)
    if (i.note) t.push(`  - Reviewpunt: ${i.note}`)
    if (i.verify.length) t.push(`  - Te controleren bron: ${i.verify.join('; ')}`)
  }
  t.push('')
}
writeFileSync(join(root, 'TODO_JURIDISCHE_REVIEW.md'), t.join('\n'))

console.log(`Modules: ${r.modules.map((m) => `${m.moduleId}:${m.lessons}L/${m.questions}V`).join(' ')}`)
console.log(`Totaal: ${tot.l} lessen, ${tot.q} vragen (${tot.qa} goedgekeurd, ${tot.qc} inhoudelijk gecontroleerd, ${tot.qr} review)`)
console.log(`Toetstermen: ${cnt('volledig')} volledig, ${cnt('review')} review, ${cnt('ontbreekt')} ontbreekt; verplichte onderdelen gedekt: ${r.mandatory.filter((m) => m.ok).length}/${r.mandatory.length}`)
for (const i of errors) console.error(`FOUT ${i.where}: ${i.message}`)
console.log(`${errors.length} fouten, ${warnings.length} waarschuwingen. Rapport: documentatie/toetsmatrijs-dekking.md`)
process.exit(errors.length ? 1 : 0)
