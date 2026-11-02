import { describe, expect, it } from 'vitest'
import type { Curriculum, Question } from '../content/schema'
import { buildConceptExam, buildOfficialExam, formatClock, passMarkFor, remainingMs, scoreExam } from './exam'
import { seeded } from './random'

const baseCur: Curriculum = {
  title: 't',
  version: '1',
  peildatum: '2026-11-02',
  matrix: { name: 'm', status: 'bron_ontbreekt', note: '' },
  exam: { totalQuestions: 50, durationMinutes: 90, passPercentage: 70, source: '' },
  modules: Array.from({ length: 11 }, (_, i) => ({ id: `m${String(i + 1).padStart(2, '0')}`, number: i + 1, title: `M${i + 1}`, short: `M${i + 1}`, termRange: '', topics: [] })),
  terms: [],
  examGroups: [],
}

function mc(id: string, moduleId: string, status: Question['reviewStatus'] = 'concept', termIds: string[] = []): Question {
  return {
    id: `q-${moduleId}-${id}`,
    moduleId,
    termIds,
    topic: 'Onderwerp',
    level: 'K',
    type: 'mc',
    prompt: 'Een vraag?',
    options: [
      { id: 'a', text: 'A', feedback: 'uitleg a' },
      { id: 'b', text: 'B', feedback: 'uitleg b' },
      { id: 'c', text: 'C', feedback: 'uitleg c' },
    ],
    correctAnswer: 'b',
    explanation: 'Uitleg waarom dit het juiste antwoord is.',
    sourceRefs: [{ law: 'Wet' }],
    origin: 'nieuw',
    reviewStatus: status,
    version: '1.0',
    lastModified: '2026-11-02',
  }
}

const pool = (n: number, status: Question['reviewStatus'] = 'concept') =>
  Array.from({ length: n }, (_, i) => mc(`l01-${i}`, baseCur.modules[i % 11].id, status))

describe('cesuur', () => {
  it('70% van 50 is 35', () => {
    expect(passMarkFor(50, 70)).toBe(35)
  })
  it('rondt naar boven af', () => {
    expect(passMarkFor(48, 70)).toBe(34) // 33,6 → 34
  })
})

describe('officieel proefexamen', () => {
  it('is geblokkeerd zonder ingelezen toetsmatrijs', () => {
    const r = buildOfficialExam(baseCur, pool(200, 'goedgekeurd'))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reasons.join(' ')).toMatch(/toetsmatrijs/)
  })

  const cur: Curriculum = {
    ...baseCur,
    matrix: { ...baseCur.matrix, status: 'ingelezen' },
    terms: [
      { id: '1.1.1', moduleId: 'm01', description: 'x', level: 'K' },
      { id: '2.1.1', moduleId: 'm02', description: 'y', level: 'B' },
    ],
    examGroups: [
      { id: 'g1', label: 'Groep 1', termIds: ['1.1.1'], questionCount: 20 },
      { id: 'g2', label: 'Groep 2', termIds: ['2.1.1'], questionCount: 30 },
    ],
  }

  it('volgt exact de aantallen per groep met alleen goedgekeurde vragen', () => {
    const qs = [
      ...Array.from({ length: 25 }, (_, i) => mc(`a${i}`, 'm01', 'goedgekeurd', ['1.1.1'])),
      ...Array.from({ length: 35 }, (_, i) => mc(`b${i}`, 'm02', 'goedgekeurd', ['2.1.1'])),
      ...Array.from({ length: 40 }, (_, i) => mc(`c${i}`, 'm02', 'concept', ['2.1.1'])),
    ]
    const r = buildOfficialExam(cur, qs, seeded(1))
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.questionIds).toHaveLength(50)
      expect(new Set(r.questionIds).size).toBe(50)
      expect(r.questionIds.filter((id) => id.startsWith('q-m01')).length).toBe(20)
      expect(r.questionIds.every((id) => !id.includes('-c'))).toBe(true)
    }
  })

  it('weigert bij te weinig goedgekeurde vragen in een groep (geen aanvulling of herhaling)', () => {
    const qs = [...Array.from({ length: 25 }, (_, i) => mc(`a${i}`, 'm01', 'goedgekeurd', ['1.1.1'])), ...Array.from({ length: 10 }, (_, i) => mc(`b${i}`, 'm02', 'goedgekeurd', ['2.1.1']))]
    const r = buildOfficialExam(cur, qs)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reasons[0]).toMatch(/Groep 2: 10/)
  })

  it('weigert als groepen niet optellen tot 50', () => {
    const r = buildOfficialExam({ ...cur, examGroups: [{ id: 'g', label: 'G', termIds: ['1.1.1'], questionCount: 49 }] }, [])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reasons.join(' ')).toMatch(/49/)
  })
})

describe('conceptproefexamen', () => {
  it('levert 50 unieke meerkeuzevragen, verdeeld over modules', () => {
    const r = buildConceptExam(baseCur, pool(120), seeded(7))
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.questionIds).toHaveLength(50)
      expect(new Set(r.questionIds).size).toBe(50)
      const perModule = new Set(r.questionIds.map((id) => id.slice(2, 5)))
      expect(perModule.size).toBe(11)
    }
  })
  it('weigert bij minder dan 50 vragen en vult niet aan met herhalingen', () => {
    const r = buildConceptExam(baseCur, pool(49))
    expect(r.ok).toBe(false)
  })
  it('negeert afgekeurde vragen', () => {
    const r = buildConceptExam(baseCur, [...pool(40), ...pool(20, 'afgekeurd').map((q) => ({ ...q, id: q.id + 'x' }))])
    expect(r.ok).toBe(false)
  })
})

describe('scoren', () => {
  it('telt goed, onbeantwoord en voldoende/onvoldoende', () => {
    const qs = pool(50)
    const answers: Record<string, string> = {}
    qs.slice(0, 35).forEach((q) => (answers[q.id] = 'b'))
    qs.slice(35, 45).forEach((q) => (answers[q.id] = 'a'))
    const r = scoreExam(qs, answers, 70)
    expect(r.correct).toBe(35)
    expect(r.unanswered).toBe(5)
    expect(r.passed).toBe(true)
    const r2 = scoreExam(qs, { ...answers, [qs[0].id]: 'c' }, 70)
    expect(r2.correct).toBe(34)
    expect(r2.passed).toBe(false)
    expect(Object.values(r.byModule).reduce((s, m) => s + m.total, 0)).toBe(50)
  })
})

describe('examenklok', () => {
  it('rekent resterende tijd uit vanaf een vaste deadline', () => {
    const start = 1_000_000
    const deadline = start + 90 * 60_000
    expect(remainingMs(deadline, start)).toBe(90 * 60_000)
    expect(remainingMs(deadline, deadline + 5)).toBe(0)
    expect(formatClock(90 * 60_000)).toBe('1:30:00')
    expect(formatClock(59_001)).toBe('01:00')
    expect(formatClock(5_000)).toBe('00:05')
  })
})
