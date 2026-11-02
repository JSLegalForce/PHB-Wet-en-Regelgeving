import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { checkContent } from '../lib/contentCheck'
import { buildConceptExam } from '../lib/exam'
import { allQuestions, curriculum } from '.'

const dir = join(__dirname, 'modules')
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => ({ file: f, data: JSON.parse(readFileSync(join(dir, f), 'utf8')) }))
const report = checkContent(JSON.parse(readFileSync(join(__dirname, 'curriculum.json'), 'utf8')), files)

describe('inhoud', () => {
  it('heeft geen schema- of verwijzingsfouten', () => {
    expect(report.issues.filter((i) => i.level === 'fout')).toEqual([])
  })
  it('heeft precies 11 modules', () => {
    expect(curriculum.modules).toHaveLength(11)
  })
  it('heeft lessen en vragen in iedere module', () => {
    for (const m of report.modules) {
      expect(m.lessons, m.moduleId).toBeGreaterThan(0)
      expect(m.questions, m.moduleId).toBeGreaterThan(0)
    }
  })
  it('examenvoorwaarden: 50 vragen, 90 minuten, 70%', () => {
    expect(curriculum.exam).toMatchObject({ totalQuestions: 50, durationMinutes: 90, passPercentage: 70 })
  })
  it('examengroepen tellen op tot 50 zodra ze zijn ingevuld', () => {
    if (curriculum.examGroups.length) expect(report.examGroupsSum).toBe(50)
  })
  it('geen enkele vraag is ten onrechte als goedgekeurd gemarkeerd zonder bron', () => {
    for (const q of allQuestions) if (q.reviewStatus === 'goedgekeurd') expect(q.sourceRefs.every((s) => !s.verify)).toBe(true)
  })
  it('er zijn genoeg unieke meerkeuzevragen voor een conceptproefexamen van 50', () => {
    const r = buildConceptExam(curriculum, allQuestions)
    expect(r.ok).toBe(true)
    if (r.ok) expect(new Set(r.questionIds).size).toBe(50)
  })
  it('juiste antwoorden zijn niet allemaal dezelfde letter', () => {
    const letters = new Set(allQuestions.flatMap((q) => (q.type === 'mc' ? [q.correctAnswer] : [])))
    expect(letters.size).toBeGreaterThan(1)
  })
})
