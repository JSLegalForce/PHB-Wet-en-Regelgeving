import { beforeEach, describe, expect, it } from 'vitest'
import { getProgress, lessonPercent, markScreen, recordAnswer, resetProgress, STORAGE_KEY, wrongQuestionIds } from './progress'

describe('lokale voortgang', () => {
  beforeEach(() => {
    localStorage.clear()
    resetProgress()
  })

  it('bewaart bekeken schermen en markeert een les als afgerond', () => {
    markScreen('m01-l01', 0, 3)
    markScreen('m01-l01', 1, 3)
    expect(lessonPercent(getProgress(), 'm01-l01', 3)).toBe(67)
    markScreen('m01-l01', 2, 3)
    expect(getProgress().lessons['m01-l01'].completed).toBe(true)
    expect(getProgress().lastLessonId).toBe('m01-l01')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).lessons['m01-l01'].seen).toEqual([0, 1, 2])
  })

  it('houdt foute vragen bij tot ze goed zijn beantwoord', () => {
    recordAnswer('q-m01-l01-1', false)
    recordAnswer('q-m01-l01-2', true)
    expect(wrongQuestionIds(getProgress())).toEqual(['q-m01-l01-1'])
    recordAnswer('q-m01-l01-1', true)
    expect(wrongQuestionIds(getProgress())).toEqual([])
    expect(getProgress().answers['q-m01-l01-1'].attempts).toBe(2)
  })

  it('slaat geen persoonsgegevens op', () => {
    markScreen('m01-l01', 0, 3)
    recordAnswer('q-m01-l01-1', true)
    const keys = Object.keys(JSON.parse(localStorage.getItem(STORAGE_KEY)!))
    expect(keys.sort()).toEqual(['answers', 'exams', 'lastLessonId', 'lessons', 'version'])
  })
})
