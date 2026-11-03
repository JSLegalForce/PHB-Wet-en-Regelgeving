import { describe, expect, it } from 'vitest'
import type { Curriculum, Level, Question } from '../content/schema'
import { buildConceptExam, buildOfficialExam, examCoverage, formatClock, matrixProblems, passMarkFor, remainingMs, scoreExam } from './exam'
import { seeded } from './random'

const modules = Array.from({ length: 11 }, (_, i) => ({ id: `m${String(i + 1).padStart(2, '0')}`, number: i + 1, title: `M${i + 1}`, short: `M${i + 1}`, termRange: '', topics: [] }))
const term = (id: string, levels: Level[], groupId: string) => ({ id, moduleId: 'm01', title: id, taxonomy: levels.join('/'), levels, description: 'x', articles: [], elements: [], groupId })

/** Testmatrix: 3 groepen, samen 50 vragen; groep B deelt twee termen. */
const cur: Curriculum = {
  title: 't',
  version: '1',
  peildatum: '2026-11-03',
  matrix: { name: 'm', status: 'ingelezen', note: '' },
  exam: { totalQuestions: 50, durationMinutes: 90, passPercentage: 70, source: '' },
  modules,
  terms: [term('1.1.1', ['K'], 'A'), term('2.1.1', ['K'], 'B'), term('2.1.2', ['K'], 'B'), term('5.3.1', ['T'], 'C')],
  examGroups: [
    { id: 'A', label: 'Groep A', termIds: ['1.1.1'], questionCount: 20 },
    { id: 'B', label: 'Groep B', termIds: ['2.1.1', '2.1.2'], questionCount: 28 },
    { id: 'C', label: 'Groep C', termIds: ['5.3.1'], questionCount: 2 },
  ],
  mandatoryItems: [],
}

let seq = 0
function mc(termIds: string[], status: Question['reviewStatus'], level: Level = 'K', extra: Partial<Question> = {}): Question {
  seq++
  return {
    id: `q-m01-x${seq}`,
    moduleId: 'm01',
    termIds,
    topic: 'Onderwerp',
    level,
    type: 'mc',
    prompt: 'Een vraag?',
    options: [
      { id: 'a', text: 'A', feedback: 'uitleg a' },
      { id: 'b', text: 'B', feedback: 'uitleg b' },
    ],
    correctAnswer: 'b',
    explanation: 'Uitleg waarom dit het juiste antwoord is.',
    sourceRefs: [{ law: 'Wet' }],
    origin: 'nieuw',
    reviewStatus: status,
    version: '1.0',
    lastModified: '2026-11-03',
    ...(status === 'goedgekeurd' ? { reviewedBy: 'Jurist', reviewedOn: '2026-11-03' } : {}),
    ...extra,
  } as Question
}
const many = (n: number, termIds: string[], status: Question['reviewStatus'], level: Level = 'K', extra: Partial<Question> = {}) => Array.from({ length: n }, () => mc(termIds, status, level, extra))
const full = (status: Question['reviewStatus']) => [...many(25, ['1.1.1'], status), ...many(20, ['2.1.1'], status), ...many(20, ['2.1.2'], status), ...many(4, ['5.3.1'], status, 'T')]
const groupOf = (ids: string[], qs: Question[]) => ids.map((id) => qs.find((q) => q.id === id)!)

describe('cesuur', () => {
  it('70% van 50 is 35', () => expect(passMarkFor(50, 70)).toBe(35))
  it('rondt naar boven af', () => expect(passMarkFor(48, 70)).toBe(34))
})

describe('matrixstructuur', () => {
  it('is in orde voor de testmatrix', () => expect(matrixProblems(cur)).toEqual([]))
  it('faalt als de quota niet optellen tot 50', () => {
    const c = { ...cur, examGroups: cur.examGroups.map((g) => (g.id === 'C' ? { ...g, questionCount: 1 } : g)) }
    expect(matrixProblems(c).join(' ')).toMatch(/49/)
  })
  it('faalt als een term in twee groepen staat of in geen enkele', () => {
    const c = { ...cur, examGroups: [...cur.examGroups.slice(0, 2), { ...cur.examGroups[2], termIds: ['1.1.1'] }] }
    expect(matrixProblems(c).join(' ')).toMatch(/1\.1\.1 staat in 2/)
    expect(matrixProblems(c).join(' ')).toMatch(/5\.3\.1 staat in 0/)
  })
  it('faalt zonder ingelezen matrix', () => {
    expect(buildOfficialExam({ ...cur, matrix: { ...cur.matrix, status: 'bron_ontbreekt' } }, full('goedgekeurd')).ok).toBe(false)
  })
})

describe('proefexamen volgens toetsmatrijs (officieel)', () => {
  it('volgt exact de quota per groep met 50 unieke goedgekeurde vragen', () => {
    const qs = [...full('goedgekeurd'), ...full('inhoudelijk_gecontroleerd')]
    const r = buildOfficialExam(cur, qs, seeded(1))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const picked = groupOf(r.questionIds, qs)
    expect(picked).toHaveLength(50)
    expect(new Set(r.questionIds).size).toBe(50)
    expect(picked.every((q) => q.reviewStatus === 'goedgekeurd')).toBe(true)
    expect(picked.filter((q) => q.termIds.includes('1.1.1'))).toHaveLength(20)
    expect(picked.filter((q) => q.termIds.includes('5.3.1'))).toHaveLength(2)
  })
  it('laat geen ongecontroleerde of alleen AI-gecontroleerde vraag toe', () => {
    const r = buildOfficialExam(cur, full('inhoudelijk_gecontroleerd'))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reasons[0]).toMatch(/Groep A: 0 juridisch goedgekeurde vragen beschikbaar, 20 nodig/)
  })
  it('weigert goedgekeurde vragen zonder aftekening of met te controleren bron', () => {
    const qs = [...many(25, ['1.1.1'], 'goedgekeurd', 'K', { reviewedBy: undefined }), ...full('goedgekeurd').slice(25)]
    expect(buildOfficialExam(cur, qs).ok).toBe(false)
    const qs2 = [...many(25, ['1.1.1'], 'goedgekeurd', 'K', { sourceRefs: [{ law: 'Wet', verify: true }] }), ...full('goedgekeurd').slice(25)]
    expect(buildOfficialExam(cur, qs2).ok).toBe(false)
  })
  it('weigert vragen zonder termIds of op het verkeerde niveau', () => {
    const qs = [...full('goedgekeurd').filter((q) => !q.termIds.includes('5.3.1')), ...many(5, [], 'goedgekeurd', 'T'), ...many(5, ['5.3.1'], 'goedgekeurd', 'K')]
    const r = buildOfficialExam(cur, qs)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reasons.join(' ')).toMatch(/Groep C: 0/)
  })
  it('vult nooit aan en herhaalt geen vragen bij een tekort', () => {
    const qs = [...many(25, ['1.1.1'], 'goedgekeurd'), ...many(10, ['2.1.1'], 'goedgekeurd'), ...many(4, ['5.3.1'], 'goedgekeurd', 'T'), ...many(40, ['2.1.1'], 'juridische_review_nodig')]
    const r = buildOfficialExam(cur, qs)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reasons).toEqual(['Groep B: 10 juridisch goedgekeurde vragen beschikbaar, 28 nodig.'])
  })
  it('verdeelt een groep met gedeelde quota over de termen en onderwerpen', () => {
    const qs = [
      ...many(25, ['1.1.1'], 'goedgekeurd'),
      ...many(20, ['2.1.1'], 'goedgekeurd'),
      ...many(20, ['2.1.2'], 'goedgekeurd'),
      ...many(5, ['5.3.1'], 'goedgekeurd', 'T', { topic: 'Artikel 45' }),
      ...many(1, ['5.3.1'], 'goedgekeurd', 'T', { topic: 'Artikel 45a' }),
    ]
    for (let s = 1; s <= 20; s++) {
      const r = buildOfficialExam(cur, qs, seeded(s))
      expect(r.ok).toBe(true)
      if (!r.ok) continue
      const picked = groupOf(r.questionIds, qs)
      const b1 = picked.filter((q) => q.termIds.includes('2.1.1')).length
      expect(Math.abs(b1 - 14)).toBeLessThanOrEqual(1)
      expect(picked.filter((q) => q.topic === 'Artikel 45a')).toHaveLength(1)
    }
  })
})

describe('conceptproefexamen', () => {
  it('volgt dezelfde quota met inhoudelijk gecontroleerde vragen', () => {
    const qs = full('inhoudelijk_gecontroleerd')
    const r = buildConceptExam(cur, qs, seeded(3))
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.warnings).toEqual([])
      expect(groupOf(r.questionIds, qs).filter((q) => q.termIds.includes('1.1.1'))).toHaveLength(20)
    }
  })
  it('vult alleen bij tekort aan met reviewvragen en meldt dat', () => {
    const qs = [...full('inhoudelijk_gecontroleerd').filter((q) => !q.termIds.includes('5.3.1')), ...many(1, ['5.3.1'], 'inhoudelijk_gecontroleerd', 'T'), ...many(3, ['5.3.1'], 'juridische_review_nodig', 'T')]
    const r = buildConceptExam(cur, qs, seeded(2))
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.warnings).toEqual(['Groep C: 1 vraag/vragen nog in juridische review gebruikt.'])
  })
  it('gebruikt nooit concept- of afgekeurde vragen', () => {
    const qs = [...full('inhoudelijk_gecontroleerd').filter((q) => !q.termIds.includes('5.3.1')), ...many(5, ['5.3.1'], 'concept', 'T'), ...many(5, ['5.3.1'], 'afgekeurd', 'T')]
    const r = buildConceptExam(cur, qs)
    expect(r.ok).toBe(false)
  })
})

describe('dekking per groep', () => {
  it('telt geschikte vragen per status en zet streefwaarde 3× quota', () => {
    const cov = examCoverage(cur, [...many(3, ['5.3.1'], 'inhoudelijk_gecontroleerd', 'T'), ...many(2, ['5.3.1'], 'juridische_review_nodig', 'T'), ...many(2, ['5.3.1'], 'inhoudelijk_gecontroleerd', 'K')])
    const c = cov.find((g) => g.id === 'C')!
    expect(c).toMatchObject({ quota: 2, gecontroleerd: 3, review: 2, target: 6 })
  })
})

describe('scoren', () => {
  it('telt goed, onbeantwoord en cesuur', () => {
    const qs = many(50, ['1.1.1'], 'goedgekeurd')
    const answers: Record<string, string | undefined> = {}
    qs.forEach((q, i) => (answers[q.id] = i < 35 ? 'b' : i < 45 ? 'a' : undefined))
    const r = scoreExam(qs, answers, 70)
    expect(r).toMatchObject({ total: 50, correct: 35, unanswered: 5, passMark: 35, passed: true, percentage: 70 })
    expect(scoreExam(qs, { ...answers, [qs[0].id]: 'a' }, 70).passed).toBe(false)
  })
})

describe('klok', () => {
  it('rekent resterende tijd en formatteert', () => {
    expect(remainingMs(1000, 400)).toBe(600)
    expect(remainingMs(1000, 2000)).toBe(0)
    expect(formatClock(90 * 60_000)).toBe('1:30:00')
    expect(formatClock(61_000)).toBe('01:01')
  })
})
