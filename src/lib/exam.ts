import type { Curriculum, Level, McQuestion, Question, ReviewStatus } from '../content/schema'
import { shuffle, type Rng } from './random'

/**
 * Twee soorten proefexamen, allebei volgens de vraagaantallen per examengroep uit de
 * ExTH-toetsmatrijs (50 gesloten vragen, 90 minuten, cesuur 70%):
 *
 * - `officieel`: "Proefexamen volgens toetsmatrijs" — uitsluitend vragen die door een jurist
 *   zijn afgetekend (`goedgekeurd`). Geen aanvulling, geen herhaling. Is er in één groep te weinig,
 *   dan is het examen geblokkeerd met een concrete reden per groep.
 * - `concept`: "Conceptproefexamen" — dezelfde verdeling, met vragen die inhoudelijk tegen de
 *   wettekst zijn gecontroleerd (`inhoudelijk_gecontroleerd`) of goedgekeurd. Alleen als een groep
 *   te weinig van die vragen heeft, wordt aangevuld met vragen die nog in juridische review zijn;
 *   dat wordt dan expliciet gemeld.
 *
 * Geen van beide is een examen van ExTH; ExTH geeft zelf geen proefexamens uit.
 */
export type ExamMode = 'officieel' | 'concept'

export interface ExamPlan {
  ok: true
  mode: ExamMode
  questionIds: string[]
  /** Meldingen die bij het examen getoond moeten worden (bv. aangevulde reviewvragen) */
  warnings: string[]
}
export interface ExamBlocked {
  ok: false
  mode: ExamMode
  reasons: string[]
}

const isMc = (q: Question): q is McQuestion => q.type === 'mc'

/** Statussen die per examensoort zijn toegestaan (in volgorde van voorkeur). */
export const examStatuses: Record<ExamMode, ReviewStatus[]> = {
  officieel: ['goedgekeurd'],
  concept: ['goedgekeurd', 'inhoudelijk_gecontroleerd'],
}
/** Alleen voor het conceptexamen: aanvulling als een groep anders niet gevuld kan worden. */
const conceptFallback: ReviewStatus[] = ['juridische_review_nodig']

/** Toegestane niveaus voor een vraag binnen een groep: de vereniging van de niveaus van de gekoppelde termen in die groep. */
function levelsFor(c: Curriculum, q: Question, groupTermIds: string[]): Set<Level> {
  const out = new Set<Level>()
  for (const t of c.terms) if (groupTermIds.includes(t.id) && q.termIds.includes(t.id)) t.levels.forEach((l) => out.add(l))
  return out
}

/** Structurele geschiktheid voor een examengroep, los van de reviewstatus. */
export function fitsGroup(c: Curriculum, q: Question, groupTermIds: string[]): boolean {
  if (!isMc(q)) return false
  if (!q.termIds.some((t) => groupTermIds.includes(t))) return false
  if (!levelsFor(c, q, groupTermIds).has(q.level)) return false
  if (q.reviewStatus === 'goedgekeurd' && (!q.reviewedBy || q.sourceRefs.some((s) => s.verify))) return false
  return true
}

/** Controle van de matrixstructuur in het curriculum. */
export function matrixProblems(c: Curriculum): string[] {
  const p: string[] = []
  if (c.matrix.status !== 'ingelezen' || c.terms.length === 0) p.push('De officiële examentermen uit de PHB-toetsmatrijs zijn nog niet ingelezen.')
  if (c.examGroups.length === 0) p.push('De officiële aantallen vragen per examengroep zijn nog niet ingelezen.')
  const sum = c.examGroups.reduce((s, g) => s + g.questionCount, 0)
  if (c.examGroups.length > 0 && sum !== c.exam.totalQuestions) p.push(`De examengroepen tellen op tot ${sum} vragen in plaats van ${c.exam.totalQuestions}.`)
  const inGroups = c.examGroups.flatMap((g) => g.termIds)
  for (const t of c.terms) {
    const n = inGroups.filter((x) => x === t.id).length
    if (n !== 1) p.push(`Term ${t.id} staat in ${n} examengroepen (verwacht: precies 1).`)
  }
  for (const g of c.examGroups) {
    if (g.termIds.length === 0) p.push(`${g.label}: examengroep zonder termen.`)
    if (g.questionCount < 1) p.push(`${g.label}: ongeldig vraagaantal ${g.questionCount}.`)
  }
  return p
}

/**
 * Kiest `n` vragen uit `pool`, zo gelijk mogelijk verdeeld over de termen van de groep
 * en daarbinnen over verschillende onderwerpen (bv. art. 45 én art. 45a Alcoholwet).
 */
function spreadPick(pool: Question[], groupTermIds: string[], n: number, rng: Rng): Question[] {
  const buckets = new Map<string, Question[]>()
  for (const q of shuffle(pool, rng)) {
    const own = q.termIds.filter((t) => groupTermIds.includes(t))
    const key = `${own[Math.floor(rng() * own.length)] ?? own[0]}|${q.topic}`
    buckets.set(key, [...(buckets.get(key) ?? []), q])
  }
  // eerst per term rouleren, daarbinnen per onderwerp
  const byTerm = new Map<string, Question[][]>()
  for (const [key, list] of buckets) {
    const t = key.split('|')[0]
    byTerm.set(t, [...(byTerm.get(t) ?? []), list])
  }
  const terms = shuffle([...byTerm.keys()], rng)
  const picked: Question[] = []
  const used = new Set<string>()
  let progressed = true
  while (picked.length < n && progressed) {
    progressed = false
    for (const t of terms) {
      if (picked.length >= n) break
      const topics = byTerm.get(t)!
      // neem het onderwerp met de meeste resterende vragen dat nog het minst gekozen is
      topics.sort((a, b) => a.filter((q) => used.has(q.id)).length - b.filter((q) => used.has(q.id)).length)
      for (const list of topics) {
        const q = list.find((x) => !used.has(x.id))
        if (q) {
          used.add(q.id)
          picked.push(q)
          progressed = true
          break
        }
      }
    }
  }
  return picked
}

function buildExam(mode: ExamMode, c: Curriculum, questions: Question[], rng: Rng): ExamPlan | ExamBlocked {
  const reasons = matrixProblems(c)
  if (reasons.length) return { ok: false, mode, reasons }
  const warnings: string[] = []
  const used = new Set<string>()
  const picked: string[] = []
  const allowed = examStatuses[mode]
  for (const g of c.examGroups) {
    const fit = questions.filter((q) => !used.has(q.id) && fitsGroup(c, q, g.termIds))
    let chosen = spreadPick(
      fit.filter((q) => allowed.includes(q.reviewStatus)),
      g.termIds,
      g.questionCount,
      rng,
    )
    if (chosen.length < g.questionCount && mode === 'concept') {
      const extra = spreadPick(
        fit.filter((q) => conceptFallback.includes(q.reviewStatus) && !chosen.includes(q)),
        g.termIds,
        g.questionCount - chosen.length,
        rng,
      )
      if (extra.length) warnings.push(`${g.label}: ${extra.length} vraag/vragen nog in juridische review gebruikt.`)
      chosen = [...chosen, ...extra]
    }
    if (chosen.length < g.questionCount) {
      const label = mode === 'officieel' ? 'juridisch goedgekeurde' : 'inhoudelijk gecontroleerde'
      reasons.push(`${g.label}: ${chosen.length} ${label} vragen beschikbaar, ${g.questionCount} nodig.`)
      continue
    }
    for (const q of chosen) {
      used.add(q.id)
      picked.push(q.id)
    }
  }
  if (reasons.length) return { ok: false, mode, reasons }
  if (picked.length !== c.exam.totalQuestions || new Set(picked).size !== picked.length) {
    return { ok: false, mode, reasons: [`Samenstelling mislukt: ${picked.length} vragen gekozen.`] }
  }
  return { ok: true, mode, questionIds: shuffle(picked, rng), warnings }
}

/** Proefexamen volgens toetsmatrijs met uitsluitend juridisch goedgekeurde vragen. */
export function buildOfficialExam(c: Curriculum, questions: Question[], rng: Rng = Math.random): ExamPlan | ExamBlocked {
  return buildExam('officieel', c, questions, rng)
}

/** Conceptproefexamen volgens toetsmatrijs met inhoudelijk gecontroleerde vragen. */
export function buildConceptExam(c: Curriculum, questions: Question[], rng: Rng = Math.random): ExamPlan | ExamBlocked {
  return buildExam('concept', c, questions, rng)
}

export interface GroupCoverage {
  id: string
  label: string
  termIds: string[]
  quota: number
  /** Aantal geschikte mc-vragen per status */
  goedgekeurd: number
  gecontroleerd: number
  review: number
  concept: number
  /** Streefwaarde: 3 varianten per examenvraag */
  target: number
}

/** Dekking per examengroep (geschikte meerkeuzevragen op passend niveau). */
export function examCoverage(c: Curriculum, questions: Question[]): GroupCoverage[] {
  return c.examGroups.map((g) => {
    const fit = questions.filter((q) => fitsGroup(c, q, g.termIds))
    const n = (s: ReviewStatus) => fit.filter((q) => q.reviewStatus === s).length
    return {
      id: g.id,
      label: g.label,
      termIds: g.termIds,
      quota: g.questionCount,
      goedgekeurd: n('goedgekeurd'),
      gecontroleerd: n('inhoudelijk_gecontroleerd'),
      review: n('juridische_review_nodig'),
      concept: n('concept'),
      target: g.questionCount * 3,
    }
  })
}

export interface ExamResult {
  total: number
  correct: number
  unanswered: number
  passMark: number
  passed: boolean
  percentage: number
  byModule: Record<string, { correct: number; total: number }>
  byTopic: Record<string, { correct: number; total: number }>
}

/** Cesuur: minimaal passPercentage van het totaal, naar boven afgerond (70% van 50 = 35). */
export function passMarkFor(total: number, passPercentage: number): number {
  return Math.ceil((total * passPercentage) / 100 - 1e-9)
}

export function scoreExam(questions: Question[], answers: Record<string, string | undefined>, passPercentage: number): ExamResult {
  const byModule: ExamResult['byModule'] = {}
  const byTopic: ExamResult['byTopic'] = {}
  let correct = 0
  let unanswered = 0
  for (const q of questions) {
    if (!isMc(q)) continue
    const a = answers[q.id]
    const ok = a === q.correctAnswer
    if (a === undefined) unanswered++
    if (ok) correct++
    byModule[q.moduleId] ??= { correct: 0, total: 0 }
    byModule[q.moduleId].total++
    if (ok) byModule[q.moduleId].correct++
    const tk = `${q.moduleId}|${q.topic}`
    byTopic[tk] ??= { correct: 0, total: 0 }
    byTopic[tk].total++
    if (ok) byTopic[tk].correct++
  }
  const total = questions.filter(isMc).length
  const passMark = passMarkFor(total, passPercentage)
  return { total, correct, unanswered, passMark, passed: correct >= passMark, percentage: total ? Math.round((correct / total) * 100) : 0, byModule, byTopic }
}

/** Resterende tijd in ms op basis van een vaste deadline (overleeft herladen). */
export function remainingMs(deadline: number, now: number = Date.now()): number {
  return Math.max(0, deadline - now)
}

export function formatClock(ms: number): string {
  const s = Math.ceil(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}
