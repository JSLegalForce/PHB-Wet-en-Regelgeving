import { curriculum as curriculumSchema, moduleContent, type Curriculum, type Lesson, type ModuleContent, type Question, type ReviewStatus, type SourceRef } from '../content/schema'
import { examCoverage, fitsGroup, matrixProblems, type GroupCoverage } from './exam'

export interface CheckIssue {
  level: 'fout' | 'waarschuwing'
  where: string
  message: string
}

export interface ModuleStats {
  moduleId: string
  title: string
  lessons: number
  lessonsApproved: number
  questions: number
  questionsApproved: number
  questionsChecked: number
  questionsReview: number
  examEligibleApproved: number
  examEligibleConcept: number
}

export interface TermStats {
  id: string
  title: string
  taxonomy: string
  groupId: string
  lessons: string[]
  /** mc-vragen op passend niveau, per status */
  mc: Record<ReviewStatus, number>
  /** alle vragen (alle typen) met deze term */
  allQuestions: number
  status: 'volledig' | 'review' | 'ontbreekt'
}

export interface MandatoryStats {
  id: string
  termId: string
  label: string
  lessons: number
  questions: number
  required: number
  ok: boolean
}

export interface CheckReport {
  issues: CheckIssue[]
  modules: ModuleStats[]
  termsTotal: number
  termsWithoutLesson: string[]
  termsWithoutQuestions: string[]
  examGroupsTotal: number
  examGroupsSum: number
  terms: TermStats[]
  groups: GroupCoverage[]
  mandatory: MandatoryStats[]
}

/** Een vraag is examengeschikt als het een gesloten meerkeuzevraag is. */
export function isExamEligible(q: Question): boolean {
  return q.type === 'mc'
}

/** Universele bevoegdheidsclaims die juridisch nooit kloppen. */
export const universalClaimPatterns: RegExp[] = [
  /\b(een|iedere|elke) boa (mag|is) altijd\b/i,
  /\bboa'?s? (mogen|mag) altijd\b/i,
  /\bje mag als boa altijd\b/i,
  /\b(iedere|elke) boa (mag|is bevoegd)\b/i,
  /\balle boa'?s (mogen|zijn bevoegd)\b/i,
  /\bmoet je (de verdachte )?altijd aanhouden\b/i,
]

const statusesAll: ReviewStatus[] = ['wacht_op_bron', 'concept', 'juridische_review_nodig', 'inhoudelijk_gecontroleerd', 'goedgekeurd', 'afgekeurd']
const zero = (): Record<ReviewStatus, number> => Object.fromEntries(statusesAll.map((s) => [s, 0])) as Record<ReviewStatus, number>

export function refMatches(r: SourceRef, law: string, article: string): boolean {
  return r.law.toLowerCase().includes(law.toLowerCase()) && new RegExp(article).test(r.article ?? '')
}

function lessonRefs(l: Lesson): SourceRef[] {
  return [...l.sourceRefs, ...l.screens.flatMap((s) => (s.type === 'law' ? [s.ref] : []))]
}

function texts(x: Lesson | Question): string[] {
  return JSON.stringify(x).match(/"(?:[^"\\]|\\.)*"/g) ?? []
}

/**
 * Valideert curriculum en module-inhoud: schema, verwijzingen, dubbele ID's en inhoud,
 * dekking van examentermen en verplichte onderdelen, examenaantallen en reviewregels.
 * `fileExists` (optioneel) controleert of afbeeldingen in /public bestaan.
 */
export function checkContent(rawCurriculum: unknown, rawModules: { file: string; data: unknown }[], fileExists?: (publicPath: string) => boolean): CheckReport {
  const issues: CheckIssue[] = []
  const empty: CheckReport = { issues, modules: [], termsTotal: 0, termsWithoutLesson: [], termsWithoutQuestions: [], examGroupsTotal: 0, examGroupsSum: 0, terms: [], groups: [], mandatory: [] }
  const cur = curriculumSchema.safeParse(rawCurriculum)
  if (!cur.success) {
    issues.push({ level: 'fout', where: 'curriculum.json', message: cur.error.message })
    return empty
  }
  const c: Curriculum = cur.data
  const moduleIds = new Set(c.modules.map((m) => m.id))
  const termIds = new Set(c.terms.map((t) => t.id))
  const matrixRead = c.matrix.status === 'ingelezen'
  for (const p of matrixProblems(c)) issues.push({ level: matrixRead ? 'fout' : 'waarschuwing', where: 'curriculum.json', message: p })
  for (const t of c.terms) {
    if (!moduleIds.has(t.moduleId)) issues.push({ level: 'fout', where: `term ${t.id}`, message: `Onbekende module ${t.moduleId}` })
    if (t.taxonomy.split('/').join() !== t.levels.join()) issues.push({ level: 'fout', where: `term ${t.id}`, message: 'taxonomy en levels komen niet overeen' })
    const g = c.examGroups.find((x) => x.id === t.groupId)
    if (!g || !g.termIds.includes(t.id)) issues.push({ level: 'fout', where: `term ${t.id}`, message: `groupId ${t.groupId} klopt niet met examGroups` })
  }

  const parsed: { file: string; data: ModuleContent }[] = []
  for (const m of rawModules) {
    const r = moduleContent.safeParse(m.data)
    if (!r.success) {
      for (const iss of r.error.issues) issues.push({ level: 'fout', where: `${m.file} → ${iss.path.join('.')}`, message: iss.message })
      continue
    }
    if (!moduleIds.has(r.data.moduleId)) issues.push({ level: 'fout', where: m.file, message: `Onbekende moduleId ${r.data.moduleId}` })
    parsed.push({ file: m.file, data: r.data })
  }

  const allLessons = parsed.flatMap((p) => p.data.lessons.map((l) => ({ l, file: p.file })))
  const allQuestions = parsed.flatMap((p) => p.data.questions.map((q) => ({ q, file: p.file })))
  const qById = new Map<string, Question>()
  const seen = new Set<string>()
  const seenContent = new Map<string, string>()
  const reviewMeta = (x: { reviewStatus: ReviewStatus; reviewedBy?: string; reviewedOn?: string; reviewNote?: string }, where: string, refs: SourceRef[]) => {
    if (x.reviewStatus === 'goedgekeurd' && (!x.reviewedBy || !x.reviewedOn)) issues.push({ level: 'fout', where, message: 'Goedgekeurd zonder reviewedBy/reviewedOn (aftekening ontbreekt)' })
    if (x.reviewStatus === 'goedgekeurd' && /\b(claude|ai-controle|ai)\b/i.test(x.reviewedBy ?? '')) issues.push({ level: 'fout', where, message: 'Goedkeuring moet door een menselijke jurist; AI-controle is hooguit inhoudelijk_gecontroleerd' })
    if ((x.reviewStatus === 'goedgekeurd' || x.reviewStatus === 'inhoudelijk_gecontroleerd') && refs.some((s) => s.verify)) issues.push({ level: 'fout', where, message: `Status ${x.reviewStatus} met een bronverwijzing die nog verify:true heeft` })
    if (x.reviewStatus === 'inhoudelijk_gecontroleerd' && !x.reviewedOn) issues.push({ level: 'fout', where, message: 'inhoudelijk_gecontroleerd zonder reviewedOn' })
    if (x.reviewStatus === 'juridische_review_nodig' && !x.reviewNote) issues.push({ level: 'fout', where, message: 'juridische_review_nodig zonder concreet reviewNote' })
  }

  for (const { q, file } of allQuestions) {
    const where = `${file} → ${q.id}`
    if (seen.has(q.id)) issues.push({ level: 'fout', where: file, message: `Dubbele vraag-ID ${q.id}` })
    seen.add(q.id)
    qById.set(q.id, q)
    const sig = `${q.case ?? ''}|${q.prompt}|${q.type === 'mc' ? q.options.map((o) => o.text).join('|') : ''}`.toLowerCase().replace(/\s+/g, ' ')
    if (seenContent.has(sig)) issues.push({ level: 'fout', where, message: `Inhoudelijk duplicaat van ${seenContent.get(sig)}` })
    seenContent.set(sig, q.id)
    if (q.type === 'mc' && !q.options.some((o) => o.id === q.correctAnswer)) issues.push({ level: 'fout', where, message: `correctAnswer "${q.correctAnswer}" bestaat niet als optie` })
    if (q.type === 'mc') {
      const ids = q.options.map((o) => o.id)
      if (new Set(ids).size !== ids.length) issues.push({ level: 'fout', where, message: 'Dubbele optie-ID' })
      const tx = q.options.map((o) => o.text.trim().toLowerCase())
      if (new Set(tx).size !== tx.length) issues.push({ level: 'fout', where, message: 'Twee opties hebben dezelfde tekst' })
    }
    if (!q.id.startsWith(`q-${q.moduleId}-`)) issues.push({ level: 'fout', where, message: 'Vraag-ID past niet bij moduleId' })
    for (const t of q.termIds) if (!termIds.has(t)) issues.push({ level: 'fout', where, message: `Onbekende examenterm ${t}` })
    if (matrixRead && q.reviewStatus !== 'afgekeurd' && q.termIds.length === 0) issues.push({ level: 'fout', where, message: 'Vraag zonder termIds (niet herleidbaar naar de toetsmatrijs)' })
    if (q.type === 'mc' && q.termIds.length && q.reviewStatus !== 'afgekeurd') {
      const allowed = new Set(c.terms.filter((t) => q.termIds.includes(t.id)).flatMap((t) => t.levels))
      if (!allowed.has(q.level)) issues.push({ level: 'waarschuwing', where, message: `Niveau ${q.level} past niet bij de taxonomie van ${q.termIds.join(', ')}; vraag telt niet mee voor het examen` })
    }
    if (q.figure && fileExists && !fileExists(q.figure.src)) issues.push({ level: 'fout', where, message: `Afbeelding ${q.figure.src} bestaat niet in public/` })
    reviewMeta(q, where, q.sourceRefs)
    for (const s of texts(q)) for (const re of universalClaimPatterns) if (re.test(s)) issues.push({ level: 'fout', where, message: `Universele bevoegdheidsclaim: ${s.slice(0, 120)}` })
  }

  const lessonIds = new Set<string>()
  for (const { l, file } of allLessons) {
    const where = `${file} → ${l.id}`
    if (lessonIds.has(l.id)) issues.push({ level: 'fout', where: file, message: `Dubbele les-ID ${l.id}` })
    lessonIds.add(l.id)
    if (!l.id.startsWith(l.moduleId)) issues.push({ level: 'fout', where, message: 'Les-ID past niet bij moduleId' })
    for (const t of l.termIds) if (!termIds.has(t)) issues.push({ level: 'fout', where, message: `Onbekende examenterm ${t}` })
    if (matrixRead && l.reviewStatus !== 'afgekeurd' && l.termIds.length === 0) issues.push({ level: 'fout', where, message: 'Les zonder termIds (niet herleidbaar naar de toetsmatrijs)' })
    for (const s of l.screens) {
      const ids = s.type === 'exercise' ? [s.questionId] : s.type === 'check' ? s.questionIds : []
      for (const id of ids) {
        const q = qById.get(id)
        if (!q) issues.push({ level: 'fout', where, message: `Verwijst naar onbekende vraag ${id}` })
        else if (q.moduleId !== l.moduleId) issues.push({ level: 'waarschuwing', where, message: `Vraag ${id} hoort bij andere module` })
        else if (q.reviewStatus === 'afgekeurd') issues.push({ level: 'fout', where, message: `Verwijst naar afgekeurde vraag ${id}` })
      }
    }
    reviewMeta(l, where, lessonRefs(l))
    const placeholder = /\b(lorem|ipsum|TODO|TBD|xxx)\b/i
    if (placeholder.test(JSON.stringify(l))) issues.push({ level: 'fout', where, message: 'Bevat placeholdertekst' })
    for (const s of texts(l)) for (const re of universalClaimPatterns) if (re.test(s)) issues.push({ level: 'fout', where, message: `Universele bevoegdheidsclaim: ${s.slice(0, 120)}` })
  }
  for (const { q, file } of allQuestions) {
    if (q.lessonId && !lessonIds.has(q.lessonId)) issues.push({ level: 'waarschuwing', where: `${file} → ${q.id}`, message: `Onbekende lessonId ${q.lessonId}` })
  }

  const qs = allQuestions.map((x) => x.q)
  const ls = allLessons.map((x) => x.l)
  const live = <T extends { reviewStatus: ReviewStatus }>(x: T) => x.reviewStatus !== 'afgekeurd' && x.reviewStatus !== 'wacht_op_bron'

  const modules: ModuleStats[] = c.modules.map((m) => {
    const mls = ls.filter((l) => l.moduleId === m.id)
    const mqs = qs.filter((q) => q.moduleId === m.id)
    if (mls.length === 0) issues.push({ level: 'waarschuwing', where: m.id, message: `Module ${m.number} heeft nog geen lessen` })
    if (mqs.length === 0) issues.push({ level: 'waarschuwing', where: m.id, message: `Module ${m.number} heeft nog geen vragen` })
    return {
      moduleId: m.id,
      title: m.title,
      lessons: mls.length,
      lessonsApproved: mls.filter((l) => l.reviewStatus === 'goedgekeurd').length,
      questions: mqs.length,
      questionsApproved: mqs.filter((q) => q.reviewStatus === 'goedgekeurd').length,
      questionsChecked: mqs.filter((q) => q.reviewStatus === 'inhoudelijk_gecontroleerd').length,
      questionsReview: mqs.filter((q) => q.reviewStatus === 'juridische_review_nodig').length,
      examEligibleApproved: mqs.filter((q) => isExamEligible(q) && q.reviewStatus === 'goedgekeurd').length,
      examEligibleConcept: mqs.filter((q) => isExamEligible(q) && live(q)).length,
    }
  })

  const terms: TermStats[] = c.terms.map((t) => {
    const g = c.examGroups.find((x) => x.id === t.groupId)
    const lessons = ls.filter((l) => live(l) && l.termIds.includes(t.id)).map((l) => l.id)
    const mc = zero()
    for (const q of qs) if (q.termIds.includes(t.id) && fitsGroup(c, q, [t.id])) mc[q.reviewStatus]++
    const usable = mc.goedgekeurd + mc.inhoudelijk_gecontroleerd
    const any = usable + mc.juridische_review_nodig + mc.concept
    const lessonOk = ls.some((l) => l.termIds.includes(t.id) && (l.reviewStatus === 'goedgekeurd' || l.reviewStatus === 'inhoudelijk_gecontroleerd'))
    const status: TermStats['status'] = lessons.length === 0 || any === 0 ? 'ontbreekt' : usable >= 1 && lessonOk ? 'volledig' : 'review'
    if (matrixRead && lessons.length === 0) issues.push({ level: 'fout', where: `term ${t.id}`, message: 'Geen les gekoppeld aan deze toetsterm' })
    if (matrixRead && any === 0) issues.push({ level: 'fout', where: `term ${t.id}`, message: `Geen meerkeuzevraag op niveau ${t.taxonomy} gekoppeld aan deze toetsterm` })
    void g
    return { id: t.id, title: t.title, taxonomy: t.taxonomy, groupId: t.groupId, lessons, mc, allQuestions: qs.filter((q) => q.termIds.includes(t.id) && live(q)).length, status }
  })

  const mandatory: MandatoryStats[] = c.mandatoryItems.map((mi) => {
    const lessons = ls.filter((l) => live(l) && l.termIds.includes(mi.termId) && lessonRefs(l).some((r) => refMatches(r, mi.law, mi.article))).length
    const questions = qs.filter((q) => q.type === 'mc' && live(q) && q.termIds.includes(mi.termId) && (!mi.level || q.level === mi.level) && q.sourceRefs.some((r) => refMatches(r, mi.law, mi.article))).length
    const ok = lessons >= 1 && questions >= mi.minQuestions
    if (matrixRead && !ok) issues.push({ level: 'fout', where: `verplicht onderdeel ${mi.id}`, message: `${mi.label} (term ${mi.termId}): ${lessons} les(sen), ${questions} meerkeuzevragen${mi.level ? ` op niveau ${mi.level}` : ''}; vereist ≥1 les en ≥${mi.minQuestions} vragen` })
    return { id: mi.id, termId: mi.termId, label: mi.label, lessons, questions, required: mi.minQuestions, ok }
  })

  const groups = examCoverage(c, qs)
  for (const g of groups) {
    const usable = g.goedgekeurd + g.gecontroleerd
    if (matrixRead && usable < g.quota) issues.push({ level: 'waarschuwing', where: `examengroep ${g.label}`, message: `${usable} inhoudelijk gecontroleerde/goedgekeurde vragen, quotum ${g.quota}` })
  }

  const termsWithoutLesson = terms.filter((t) => t.lessons.length === 0).map((t) => t.id)
  const termsWithoutQuestions = c.terms.filter((t) => !qs.some((q) => live(q) && q.termIds.includes(t.id))).map((t) => t.id)
  const examGroupsSum = c.examGroups.reduce((s, g) => s + g.questionCount, 0)

  return { issues, modules, termsTotal: c.terms.length, termsWithoutLesson, termsWithoutQuestions, examGroupsTotal: c.examGroups.length, examGroupsSum, terms, groups, mandatory }
}
