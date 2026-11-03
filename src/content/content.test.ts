import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { checkContent, refMatches } from '../lib/contentCheck'
import { buildConceptExam, buildOfficialExam, fitsGroup } from '../lib/exam'
import { seeded } from '../lib/random'
import { allLessons, allQuestions, curriculum } from '.'

const dir = join(__dirname, 'modules')
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => ({ file: f, data: JSON.parse(readFileSync(join(dir, f), 'utf8')) }))
const publicDir = join(__dirname, '..', '..', 'public')
const report = checkContent(JSON.parse(readFileSync(join(__dirname, 'curriculum.json'), 'utf8')), files, (p) => existsSync(join(publicDir, p)))
const live = allQuestions.filter((q) => q.reviewStatus !== 'afgekeurd' && q.reviewStatus !== 'wacht_op_bron')

describe('toetsmatrijs PHB Wet- en Regelgeving Domein I v1.3', () => {
  it('is ingelezen als v1.3 met bron-URL', () => {
    expect(curriculum.matrix).toMatchObject({ status: 'ingelezen', version: '1.3', date: '2025-03-04' })
    expect(curriculum.matrix.url).toMatch(/exth\.nl.*1\.3\.pdf$/)
  })
  it('bevat alle 49 toetstermen 1.1.1 t/m 5.8.1, elk precies één keer', () => {
    const ids = curriculum.terms.map((t) => t.id)
    expect(ids).toHaveLength(49)
    expect(new Set(ids).size).toBe(49)
    expect(ids[0]).toBe('1.1.1')
    expect(ids.at(-1)).toBe('5.8.1')
    for (const id of ['2.2.1', '2.2.2', '2.2.3', '2.2.4', '2.4.2', '2.5.1', '2.5.2', '2.5.3', '2.5.4', '2.6.1', '2.6.2', '5.2.1', '5.3.1', '5.6.1', '5.6.2', '5.6.3']) expect(ids).toContain(id)
  })
  it('examengroepen: quota tellen op tot precies 50 en iedere term zit in precies één groep', () => {
    expect(curriculum.examGroups.reduce((s, g) => s + g.questionCount, 0)).toBe(50)
    const all = curriculum.examGroups.flatMap((g) => g.termIds)
    expect(all.sort()).toEqual(curriculum.terms.map((t) => t.id).sort())
  })
  it('neemt de quota uit de matrix over (steekproef)', () => {
    const q = (id: string) => curriculum.examGroups.find((g) => g.termIds.includes(id))!
    expect(q('1.1.1').questionCount).toBe(2)
    expect(q('2.2.1').questionCount).toBe(2)
    expect(q('2.2.4').questionCount).toBe(1)
    expect(q('2.5.3')).toMatchObject({ questionCount: 2, termIds: ['2.5.1', '2.5.2', '2.5.3', '2.5.4'] })
    expect(q('2.6.1').questionCount).toBe(3)
    expect(q('2.6.2').questionCount).toBe(1)
    expect(q('3.2.2').questionCount).toBe(3)
    expect(q('4.1.9')).toMatchObject({ questionCount: 1, termIds: ['4.1.8', '4.1.9'] })
    expect(q('5.2.1').questionCount).toBe(2)
    expect(q('5.3.1').questionCount).toBe(2)
    expect(q('5.6.2')).toMatchObject({ questionCount: 2, termIds: ['5.6.1', '5.6.2', '5.6.3'] })
  })
  it('taxonomie per term volgt de matrix (steekproef)', () => {
    const t = (id: string) => curriculum.terms.find((x) => x.id === id)!.taxonomy
    expect([t('2.2.1'), t('2.2.2'), t('2.2.3'), t('2.2.4'), t('5.3.1'), t('5.6.1'), t('3.2.2')]).toEqual(['K/B', 'K/T', 'B', 'T', 'T', 'K', 'K/T'])
  })
  it('examenvoorwaarden: 50 gesloten vragen, 90 minuten, cesuur 70%', () => {
    expect(curriculum.exam).toMatchObject({ totalQuestions: 50, durationMinutes: 90, passPercentage: 70 })
  })
})

describe('inhoud', () => {
  it('heeft geen schema-, verwijzings- of dekkingsfouten', () => {
    expect(report.issues.filter((i) => i.level === 'fout')).toEqual([])
  })
  it('heeft precies 11 modules met lessen en vragen', () => {
    expect(curriculum.modules).toHaveLength(11)
    for (const m of report.modules) {
      expect(m.lessons, m.moduleId).toBeGreaterThan(0)
      expect(m.questions, m.moduleId).toBeGreaterThan(0)
    }
  })
  it('iedere les en iedere vraag is gekoppeld aan ten minste één bestaande toetsterm', () => {
    const ids = new Set(curriculum.terms.map((t) => t.id))
    for (const l of allLessons) if (l.reviewStatus !== 'afgekeurd') expect(l.termIds.length && l.termIds.every((t) => ids.has(t)), l.id).toBeTruthy()
    for (const q of live) expect(q.termIds.length && q.termIds.every((t) => ids.has(t)), q.id).toBeTruthy()
  })
  it('iedere toetsterm heeft een les én een meerkeuzevraag op het matrixniveau', () => {
    for (const t of curriculum.terms) {
      expect(allLessons.some((l) => l.termIds.includes(t.id)), `les ${t.id}`).toBe(true)
      expect(live.some((q) => q.termIds.includes(t.id) && fitsGroup(curriculum, q, [t.id])), `vraag ${t.id}`).toBe(true)
    }
  })
  it('geen dubbele vraag-ID’s of inhoudelijk identieke vragen', () => {
    expect(new Set(allQuestions.map((q) => q.id)).size).toBe(allQuestions.length)
    const sig = allQuestions.map((q) => `${q.case ?? ''}|${q.prompt}`.toLowerCase())
    expect(new Set(sig).size).toBe(sig.length)
  })
  it('juiste antwoorden zijn gespreid over de letters', () => {
    const letters = allQuestions.flatMap((q) => (q.type === 'mc' ? [q.correctAnswer] : []))
    for (const l of ['a', 'b', 'c']) expect(letters.filter((x) => x === l).length / letters.length).toBeGreaterThan(0.15)
  })
  it('afbeeldingen bij vragen bestaan en hebben een volledige beschrijving', () => {
    for (const q of allQuestions) if (q.figure) {
      expect(existsSync(join(publicDir, q.figure.src)), q.figure.src).toBe(true)
      expect(q.figure.alt.length).toBeGreaterThan(30)
    }
  })
})

describe('verplichte strafbare feiten en bevoegdheden uit de matrix', () => {
  const required = ['sr-184', 'sr-185', 'sr-266-267-269', 'sr-285', 'sr-231', 'sv-55b', 'sv-55a', 'sv-96b', 'sv-488aa-489', 'sr-77e', 'sv-27c', 'alc-45', 'alc-45a', 'rvv-23-26', 'bal-3214', 'bruidsschat-2253', 'wed-24a']
  it('staan allemaal in de lijst met verplichte onderdelen (mogen niet stil verdwijnen)', () => {
    const ids = curriculum.mandatoryItems.map((m) => m.id)
    for (const r of required) expect(ids).toContain(r)
  })
  it('zijn allemaal gedekt met een les en voldoende meerkeuzevragen', () => {
    const missing = report.mandatory.filter((m) => !m.ok)
    expect(missing).toEqual([])
  })
  it('art. 184, 185, 266/267/269 en 285 Sr worden elk op niveau T geoefend', () => {
    for (const [law, art] of [
      ['Wetboek van Strafrecht', '^art\\. 184'],
      ['Wetboek van Strafrecht', '^art\\. 185'],
      ['Wetboek van Strafrecht', '^art\\. 267'],
      ['Wetboek van Strafrecht', '^art\\. 285'],
    ]) {
      const n = live.filter((q) => q.type === 'mc' && q.level === 'T' && q.termIds.includes('2.2.4') && q.sourceRefs.some((r) => refMatches(r, law, art))).length
      expect(n, art).toBeGreaterThanOrEqual(2)
    }
  })
  it('art. 45 én art. 45a Alcoholwet worden beide geoefend op niveau T', () => {
    for (const art of ['^art\\. 45( lid \\d)?$', '^art\\. 45a']) {
      const n = live.filter((q) => q.type === 'mc' && q.level === 'T' && q.termIds.includes('5.3.1') && q.sourceRefs.some((r) => refMatches(r, 'Alcoholwet', art))).length
      expect(n, art).toBeGreaterThanOrEqual(3)
    }
  })
  it('term 5.2.1 heeft vragen met een afbeelding van de verkeerssituatie', () => {
    expect(live.filter((q) => q.termIds.includes('5.2.1') && q.figure).length).toBeGreaterThanOrEqual(4)
  })
})

describe('reviewregels en examen', () => {
  it('geen enkele vraag of les is goedgekeurd zonder menselijke aftekening', () => {
    for (const x of [...allQuestions, ...allLessons]) if (x.reviewStatus === 'goedgekeurd') {
      expect(x.reviewedBy && !/claude|\bai\b/i.test(x.reviewedBy), x.id).toBeTruthy()
      expect(x.sourceRefs.every((s) => !s.verify), x.id).toBe(true)
    }
  })
  it('juridische_review_nodig heeft altijd een concreet reviewpunt', () => {
    for (const x of [...allQuestions, ...allLessons]) if (x.reviewStatus === 'juridische_review_nodig') expect((x.reviewNote ?? '').length, x.id).toBeGreaterThan(20)
  })
  it('het proefexamen volgens toetsmatrijs bevat uitsluitend goedgekeurde vragen of is geblokkeerd met reden per groep', () => {
    for (let s = 1; s <= 10; s++) {
      const r = buildOfficialExam(curriculum, allQuestions, seeded(s))
      if (r.ok) {
        expect(r.questionIds).toHaveLength(50)
        for (const id of r.questionIds) expect(allQuestions.find((q) => q.id === id)!.reviewStatus).toBe('goedgekeurd')
      } else {
        expect(r.reasons.length).toBeGreaterThan(0)
        expect(r.reasons.every((x) => /Term|Termen|toetsmatrijs|examengroep/.test(x))).toBe(true)
      }
    }
  })
  it('het conceptproefexamen volgt exact de quota per examengroep met 50 unieke vragen', () => {
    for (let s = 1; s <= 20; s++) {
      const r = buildConceptExam(curriculum, allQuestions, seeded(s))
      expect(r.ok, r.ok ? '' : r.reasons.join('\n')).toBe(true)
      if (!r.ok) return
      expect(new Set(r.questionIds).size).toBe(50)
      const qs = r.questionIds.map((id) => allQuestions.find((q) => q.id === id)!)
      expect(qs.every((q) => q.type === 'mc' && ['goedgekeurd', 'inhoudelijk_gecontroleerd', 'juridische_review_nodig'].includes(q.reviewStatus))).toBe(true)
      for (const g of curriculum.examGroups) {
        const n = qs.filter((q) => fitsGroup(curriculum, q, g.termIds)).length
        expect(n, g.label).toBeGreaterThanOrEqual(g.questionCount)
      }
    }
  })
})
