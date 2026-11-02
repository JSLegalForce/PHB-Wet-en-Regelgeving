import { useSyncExternalStore } from 'react'

/**
 * Lokale voortgang (alleen in deze browser, via localStorage).
 * Let op: dit is GEEN centrale of veilige leerlingregistratie. Er worden geen
 * persoonsgegevens opgeslagen; alleen welke lessen en vragen in deze browser zijn gedaan.
 */

export interface AnswerStat {
  attempts: number
  correct: number
  lastCorrect: boolean
  lastAt: number
}

export interface ExamRecord {
  at: number
  mode: 'officieel' | 'concept'
  correct: number
  total: number
  passed: boolean
  byModule: Record<string, { correct: number; total: number }>
  questionIds: string[]
  answers: Record<string, string>
}

export interface ActiveExam {
  mode: 'officieel' | 'concept'
  questionIds: string[]
  answers: Record<string, string>
  flagged: string[]
  current: number
  deadline: number
  startedAt: number
}

export interface Progress {
  version: 1
  lessons: Record<string, { seen: number[]; lastScreen: number; completed: boolean; at: number }>
  lastLessonId?: string
  answers: Record<string, AnswerStat>
  exams: ExamRecord[]
  activeExam?: ActiveExam
}

export const STORAGE_KEY = 'jslf-phb-wr-voortgang-v1'
const empty = (): Progress => ({ version: 1, lessons: {}, answers: {}, exams: [] })

let state: Progress = load()
const listeners = new Set<() => void>()

function load(): Progress {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY)
    if (!raw) return empty()
    const p = JSON.parse(raw) as Progress
    if (p?.version !== 1) return empty()
    return { ...empty(), ...p }
  } catch {
    return empty()
  }
}

function save() {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* opslag niet beschikbaar (privévenster, geblokkeerd): voortgang alleen in dit tabblad */
  }
}

function update(fn: (p: Progress) => Progress) {
  state = fn(state)
  save()
  listeners.forEach((l) => l())
}

export function getProgress(): Progress {
  return state
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => state,
    () => state,
  )
}

export function markScreen(lessonId: string, index: number, total: number) {
  update((p) => {
    const cur = p.lessons[lessonId] ?? { seen: [], lastScreen: 0, completed: false, at: 0 }
    const seen = cur.seen.includes(index) ? cur.seen : [...cur.seen, index].sort((a, b) => a - b)
    return {
      ...p,
      lastLessonId: lessonId,
      lessons: { ...p.lessons, [lessonId]: { seen, lastScreen: index, completed: cur.completed || seen.length >= total, at: Date.now() } },
    }
  })
}

export function recordAnswer(questionId: string, correct: boolean) {
  update((p) => {
    const cur = p.answers[questionId] ?? { attempts: 0, correct: 0, lastCorrect: false, lastAt: 0 }
    return {
      ...p,
      answers: { ...p.answers, [questionId]: { attempts: cur.attempts + 1, correct: cur.correct + (correct ? 1 : 0), lastCorrect: correct, lastAt: Date.now() } },
    }
  })
}

export function setActiveExam(exam: ActiveExam | undefined) {
  update((p) => ({ ...p, activeExam: exam }))
}

export function patchActiveExam(patch: Partial<ActiveExam>) {
  update((p) => (p.activeExam ? { ...p, activeExam: { ...p.activeExam, ...patch } } : p))
}

export function addExamRecord(r: ExamRecord) {
  update((p) => ({ ...p, exams: [r, ...p.exams].slice(0, 20), activeExam: undefined }))
}

export function resetProgress() {
  update(() => empty())
}

/** Vragen waarvan het laatste antwoord fout was. */
export function wrongQuestionIds(p: Progress): string[] {
  return Object.entries(p.answers)
    .filter(([, s]) => !s.lastCorrect)
    .sort((a, b) => b[1].lastAt - a[1].lastAt)
    .map(([id]) => id)
}

export function lessonPercent(p: Progress, lessonId: string, totalScreens: number): number {
  const l = p.lessons[lessonId]
  if (!l) return 0
  if (l.completed) return 100
  return Math.round((l.seen.length / Math.max(1, totalScreens)) * 100)
}
