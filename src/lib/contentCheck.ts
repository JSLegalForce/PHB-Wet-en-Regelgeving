import { curriculum as curriculumSchema, moduleContent, type Curriculum, type ModuleContent, type Question } from '../content/schema'

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
  examEligibleApproved: number
  examEligibleConcept: number
}

export interface CheckReport {
  issues: CheckIssue[]
  modules: ModuleStats[]
  termsTotal: number
  termsWithoutLesson: string[]
  termsWithoutQuestions: string[]
  examGroupsTotal: number
  examGroupsSum: number
}

/** Een vraag is examengeschikt als het een gesloten meerkeuzevraag is. */
export function isExamEligible(q: Question): boolean {
  return q.type === 'mc'
}

/**
 * Valideert curriculum en module-inhoud: schema, verwijzingen, dubbele ID's,
 * dekking van examentermen en examenaantallen.
 */
export function checkContent(rawCurriculum: unknown, rawModules: { file: string; data: unknown }[]): CheckReport {
  const issues: CheckIssue[] = []
  const cur = curriculumSchema.safeParse(rawCurriculum)
  if (!cur.success) {
    issues.push({ level: 'fout', where: 'curriculum.json', message: cur.error.message })
    return { issues, modules: [], termsTotal: 0, termsWithoutLesson: [], termsWithoutQuestions: [], examGroupsTotal: 0, examGroupsSum: 0 }
  }
  const c: Curriculum = cur.data
  const moduleIds = new Set(c.modules.map((m) => m.id))
  const termIds = new Set(c.terms.map((t) => t.id))

  const parsed: { file: string; data: ModuleContent }[] = []
  for (const m of rawModules) {
    const r = moduleContent.safeParse(m.data)
    if (!r.success) {
      for (const iss of r.error.issues) {
        issues.push({ level: 'fout', where: `${m.file} → ${iss.path.join('.')}`, message: iss.message })
      }
      continue
    }
    if (!moduleIds.has(r.data.moduleId)) issues.push({ level: 'fout', where: m.file, message: `Onbekende moduleId ${r.data.moduleId}` })
    parsed.push({ file: m.file, data: r.data })
  }

  const allLessons = parsed.flatMap((p) => p.data.lessons.map((l) => ({ l, file: p.file })))
  const allQuestions = parsed.flatMap((p) => p.data.questions.map((q) => ({ q, file: p.file })))
  const qById = new Map<string, Question>()
  const seen = new Set<string>()
  for (const { q, file } of allQuestions) {
    if (seen.has(q.id)) issues.push({ level: 'fout', where: file, message: `Dubbele vraag-ID ${q.id}` })
    seen.add(q.id)
    qById.set(q.id, q)
    if (q.type === 'mc' && !q.options.some((o) => o.id === q.correctAnswer)) {
      issues.push({ level: 'fout', where: `${file} → ${q.id}`, message: `correctAnswer "${q.correctAnswer}" bestaat niet als optie` })
    }
    if (q.type === 'mc') {
      const ids = q.options.map((o) => o.id)
      if (new Set(ids).size !== ids.length) issues.push({ level: 'fout', where: `${file} → ${q.id}`, message: 'Dubbele optie-ID' })
      const texts = q.options.map((o) => o.text.trim().toLowerCase())
      if (new Set(texts).size !== texts.length) issues.push({ level: 'fout', where: `${file} → ${q.id}`, message: 'Twee opties hebben dezelfde tekst' })
    }
    if (!q.id.startsWith(`q-${q.moduleId}-`)) issues.push({ level: 'fout', where: `${file} → ${q.id}`, message: 'Vraag-ID past niet bij moduleId' })
    for (const t of q.termIds) if (!termIds.has(t)) issues.push({ level: 'fout', where: `${file} → ${q.id}`, message: `Onbekende examenterm ${t}` })
    if (q.reviewStatus === 'goedgekeurd' && q.sourceRefs.some((s) => s.verify)) {
      issues.push({ level: 'fout', where: `${file} → ${q.id}`, message: 'Goedgekeurde vraag heeft nog een bronverwijzing met verify:true' })
    }
  }

  const lessonIds = new Set<string>()
  for (const { l, file } of allLessons) {
    if (lessonIds.has(l.id)) issues.push({ level: 'fout', where: file, message: `Dubbele les-ID ${l.id}` })
    lessonIds.add(l.id)
    if (!l.id.startsWith(l.moduleId)) issues.push({ level: 'fout', where: `${file} → ${l.id}`, message: 'Les-ID past niet bij moduleId' })
    for (const t of l.termIds) if (!termIds.has(t)) issues.push({ level: 'fout', where: `${file} → ${l.id}`, message: `Onbekende examenterm ${t}` })
    for (const s of l.screens) {
      const ids = s.type === 'exercise' ? [s.questionId] : s.type === 'check' ? s.questionIds : []
      for (const id of ids) {
        const q = qById.get(id)
        if (!q) issues.push({ level: 'fout', where: `${file} → ${l.id}`, message: `Verwijst naar onbekende vraag ${id}` })
        else if (q.moduleId !== l.moduleId) issues.push({ level: 'waarschuwing', where: `${file} → ${l.id}`, message: `Vraag ${id} hoort bij andere module` })
      }
    }
    if (l.reviewStatus === 'goedgekeurd' && l.sourceRefs.some((s) => s.verify)) {
      issues.push({ level: 'fout', where: `${file} → ${l.id}`, message: 'Goedgekeurde les heeft nog een bronverwijzing met verify:true' })
    }
    const placeholder = /\b(lorem|ipsum|TODO|TBD|xxx)\b/i
    if (placeholder.test(JSON.stringify(l))) issues.push({ level: 'fout', where: `${file} → ${l.id}`, message: 'Bevat placeholdertekst' })
  }
  for (const { q, file } of allQuestions) {
    if (q.lessonId && !lessonIds.has(q.lessonId)) issues.push({ level: 'waarschuwing', where: `${file} → ${q.id}`, message: `Onbekende lessonId ${q.lessonId}` })
  }

  const modules: ModuleStats[] = c.modules.map((m) => {
    const ls = allLessons.filter((x) => x.l.moduleId === m.id).map((x) => x.l)
    const qs = allQuestions.filter((x) => x.q.moduleId === m.id).map((x) => x.q)
    if (ls.length === 0) issues.push({ level: 'waarschuwing', where: m.id, message: `Module ${m.number} heeft nog geen lessen` })
    if (qs.length === 0) issues.push({ level: 'waarschuwing', where: m.id, message: `Module ${m.number} heeft nog geen vragen` })
    return {
      moduleId: m.id,
      title: m.title,
      lessons: ls.length,
      lessonsApproved: ls.filter((l) => l.reviewStatus === 'goedgekeurd').length,
      questions: qs.length,
      questionsApproved: qs.filter((q) => q.reviewStatus === 'goedgekeurd').length,
      examEligibleApproved: qs.filter((q) => isExamEligible(q) && q.reviewStatus === 'goedgekeurd').length,
      examEligibleConcept: qs.filter((q) => isExamEligible(q) && q.reviewStatus !== 'afgekeurd' && q.reviewStatus !== 'wacht_op_bron').length,
    }
  })

  const termsWithoutLesson = c.terms.filter((t) => !allLessons.some((x) => x.l.termIds.includes(t.id))).map((t) => t.id)
  const termsWithoutQuestions = c.terms.filter((t) => !allQuestions.some((x) => x.q.termIds.includes(t.id))).map((t) => t.id)
  if (c.matrix.status !== 'ingelezen') issues.push({ level: 'waarschuwing', where: 'curriculum.json', message: 'PHB-toetsmatrijs nog niet ingelezen: officiële examentermen en aantallen ontbreken' })
  const examGroupsSum = c.examGroups.reduce((s, g) => s + g.questionCount, 0)
  if (c.examGroups.length > 0 && examGroupsSum !== c.exam.totalQuestions) {
    issues.push({ level: 'fout', where: 'curriculum.json', message: `Examengroepen tellen op tot ${examGroupsSum}, verwacht ${c.exam.totalQuestions}` })
  }
  for (const g of c.examGroups) for (const t of g.termIds) if (!termIds.has(t)) issues.push({ level: 'fout', where: `examGroups ${g.id}`, message: `Onbekende term ${t}` })

  return { issues, modules, termsTotal: c.terms.length, termsWithoutLesson, termsWithoutQuestions, examGroupsTotal: c.examGroups.length, examGroupsSum }
}
