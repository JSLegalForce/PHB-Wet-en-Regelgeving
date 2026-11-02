import type { Curriculum, McQuestion, Question } from '../content/schema'
import { shuffle, type Rng } from './random'

export type ExamMode = 'officieel' | 'concept'

export interface ExamPlan {
  ok: true
  mode: ExamMode
  questionIds: string[]
}
export interface ExamBlocked {
  ok: false
  mode: ExamMode
  reasons: string[]
}

const isMc = (q: Question): q is McQuestion => q.type === 'mc'

/**
 * Officieel proefexamen: volgt exact de aantallen per examengroep uit de PHB-toetsmatrijs
 * en gebruikt uitsluitend goedgekeurde meerkeuzevragen. Geen herhalingen, geen aanvulling.
 */
export function buildOfficialExam(c: Curriculum, questions: Question[], rng: Rng = Math.random): ExamPlan | ExamBlocked {
  const reasons: string[] = []
  if (c.matrix.status !== 'ingelezen' || c.terms.length === 0) reasons.push('De officiële examentermen uit de PHB-toetsmatrijs zijn nog niet ingelezen.')
  if (c.examGroups.length === 0) reasons.push('De officiële aantallen vragen per examengroep zijn nog niet ingelezen.')
  const sum = c.examGroups.reduce((s, g) => s + g.questionCount, 0)
  if (c.examGroups.length > 0 && sum !== c.exam.totalQuestions) reasons.push(`De examengroepen tellen op tot ${sum} vragen in plaats van ${c.exam.totalQuestions}.`)
  const approved = questions.filter((q) => isMc(q) && q.reviewStatus === 'goedgekeurd')
  const used = new Set<string>()
  const picked: string[] = []
  for (const g of c.examGroups) {
    const pool = approved.filter((q) => !used.has(q.id) && q.termIds.some((t) => g.termIds.includes(t)))
    if (pool.length < g.questionCount) {
      reasons.push(`${g.label}: ${pool.length} goedgekeurde vragen beschikbaar, ${g.questionCount} nodig.`)
      continue
    }
    for (const q of shuffle(pool, rng).slice(0, g.questionCount)) {
      used.add(q.id)
      picked.push(q.id)
    }
  }
  if (reasons.length) return { ok: false, mode: 'officieel', reasons }
  return { ok: true, mode: 'officieel', questionIds: shuffle(picked, rng) }
}

/**
 * Conceptproefexamen: 50 unieke meerkeuzevragen (concept of goedgekeurd), zo gelijk mogelijk
 * verdeeld over de modules. Volgt NIET de officiële matrixverdeling en is daarom
 * altijd als concept gelabeld.
 */
export function buildConceptExam(c: Curriculum, questions: Question[], rng: Rng = Math.random): ExamPlan | ExamBlocked {
  const total = c.exam.totalQuestions
  const pool = questions.filter((q) => isMc(q) && (q.reviewStatus === 'concept' || q.reviewStatus === 'juridische_review_nodig' || q.reviewStatus === 'goedgekeurd'))
  if (pool.length < total) {
    return { ok: false, mode: 'concept', reasons: [`Er zijn ${pool.length} bruikbare meerkeuzevragen; voor een proefexamen zijn ${total} unieke vragen nodig.`] }
  }
  const byModule = c.modules.map((m) => shuffle(pool.filter((q) => q.moduleId === m.id), rng))
  const picked: string[] = []
  // Round-robin over modules tot 50 vragen; kleine modules raken eerder op.
  while (picked.length < total) {
    let progressed = false
    for (const list of byModule) {
      if (picked.length >= total) break
      const q = list.shift()
      if (q) {
        picked.push(q.id)
        progressed = true
      }
    }
    if (!progressed) break
  }
  return { ok: true, mode: 'concept', questionIds: shuffle(picked, rng) }
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
