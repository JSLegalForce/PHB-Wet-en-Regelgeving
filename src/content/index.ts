import curriculumRaw from './curriculum.json'
import { curriculum as curriculumSchema, moduleContent, type GlossaryEntry, type Lesson, type Question } from './schema'

/**
 * Laadt alle inhoud uit src/content/modules/*.json en voegt bestanden per module samen.
 * Ongeldige inhoud wordt niet stil overgeslagen: de build controleert dit vooraf
 * (npm run check:content); hier gooien we een duidelijke fout.
 */
const files = import.meta.glob('./modules/*.json', { eager: true, import: 'default' }) as Record<string, unknown>

export const curriculum = curriculumSchema.parse(curriculumRaw)

const lessons: Lesson[] = []
const questions: Question[] = []
const glossary: GlossaryEntry[] = []

for (const [path, data] of Object.entries(files).sort(([a], [b]) => a.localeCompare(b))) {
  const r = moduleContent.safeParse(data)
  if (!r.success) {
    throw new Error(`Ongeldige inhoud in ${path}: ${r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`)
  }
  lessons.push(...r.data.lessons)
  questions.push(...r.data.questions)
  glossary.push(...r.data.glossary)
}

lessons.sort((a, b) => a.moduleId.localeCompare(b.moduleId) || a.order - b.order)

/** Afgekeurde inhoud wordt nooit getoond. */
export const allLessons = lessons.filter((l) => l.reviewStatus !== 'afgekeurd')
export const allQuestions = questions.filter((q) => q.reviewStatus !== 'afgekeurd')
export const allGlossary = glossary.filter((g) => g.reviewStatus !== 'afgekeurd').sort((a, b) => a.term.localeCompare(b.term, 'nl'))

const qIndex = new Map(allQuestions.map((q) => [q.id, q]))
const lIndex = new Map(allLessons.map((l) => [l.id, l]))

export const getQuestion = (id: string) => qIndex.get(id)
export const getLesson = (id: string) => lIndex.get(id)
export const getModule = (id: string) => curriculum.modules.find((m) => m.id === id)
export const lessonsOf = (moduleId: string) => allLessons.filter((l) => l.moduleId === moduleId)
export const questionsOf = (moduleId: string) => allQuestions.filter((q) => q.moduleId === moduleId)

/** Vragen die in oefenen worden gebruikt: alles behalve "wacht op bron". */
export const practiceQuestions = allQuestions.filter((q) => q.reviewStatus !== 'wacht_op_bron')
export const approvedQuestions = allQuestions.filter((q) => q.reviewStatus === 'goedgekeurd')

export function nextLesson(lessonId: string): Lesson | undefined {
  const i = allLessons.findIndex((l) => l.id === lessonId)
  return i >= 0 ? allLessons[i + 1] : undefined
}
