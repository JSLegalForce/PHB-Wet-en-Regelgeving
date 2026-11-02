import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import type { McQuestion } from '../content/schema'
import { curriculum, getModule, getQuestion } from '../content'
import { formatClock, remainingMs, scoreExam } from '../lib/exam'
import { addExamRecord, getProgress, patchActiveExam, recordAnswer, useProgress } from '../lib/progress'
import { Icon } from '../components/Layout'
import { RichText } from '../components/ui'

export function ExamRun() {
  const p = useProgress()
  const nav = useNavigate()
  const exam = p.activeExam
  const [now, setNow] = useState(Date.now())
  const [confirm, setConfirm] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const submittedRef = useRef(false)

  const submit = useCallback(() => {
    const ex = getProgress().activeExam
    if (!ex || submittedRef.current) return
    submittedRef.current = true
    const qs = ex.questionIds.map((id) => getQuestion(id)!).filter(Boolean)
    const r = scoreExam(qs, ex.answers, curriculum.exam.passPercentage)
    for (const q of qs) if (q.type === 'mc' && ex.answers[q.id] !== undefined) recordAnswer(q.id, ex.answers[q.id] === q.correctAnswer)
    addExamRecord({ at: Date.now(), mode: ex.mode, correct: r.correct, total: r.total, passed: r.passed, byModule: r.byModule, questionIds: ex.questionIds, answers: ex.answers })
    nav('/proefexamen/uitslag', { replace: true })
  }, [nav])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const left = exam ? remainingMs(exam.deadline, now) : 0
  useEffect(() => {
    if (exam && left <= 0) submit()
  }, [exam, left, submit])

  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (confirm && !d.open) d.showModal()
    if (!confirm && d.open) d.close()
  }, [confirm])

  useEffect(() => {
    headingRef.current?.focus()
  }, [exam?.current])

  if (!exam) return submittedRef.current ? null : <Navigate to="/proefexamen" replace />

  const q = getQuestion(exam.questionIds[exam.current]) as McQuestion | undefined
  const total = exam.questionIds.length
  const answeredCount = exam.questionIds.filter((id) => exam.answers[id] !== undefined).length
  const unanswered = total - answeredCount
  const go = (i: number) => patchActiveExam({ current: Math.max(0, Math.min(total - 1, i)) })
  const flagged = exam.flagged.includes(exam.questionIds[exam.current])
  const lowTime = left < 5 * 60_000

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-30 -mx-4 flex flex-wrap items-center gap-3 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div>
          <p className="eyebrow">{exam.mode === 'concept' ? 'Conceptproefexamen' : 'Proefexamen'}</p>
          <p className="font-bold text-navy-900">
            Vraag {exam.current + 1} van {total} · {answeredCount} beantwoord
          </p>
        </div>
        <div
          className={`ml-auto flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-lg font-bold tabular-nums ${lowTime ? 'bg-bad-50 text-bad' : 'bg-ink text-white'}`}
          role="timer"
          aria-label={`Resterende tijd ${formatClock(left)}`}
        >
          <Icon name="clock" size={18} /> {formatClock(left)}
        </div>
        <button type="button" className="btn-primary" onClick={() => setConfirm(true)}>
          Inleveren
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {lowTime && left > 0 ? 'Let op: nog minder dan vijf minuten.' : ''}
      </p>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        {q ? (
          <article className="card space-y-4 p-5 sm:p-7" aria-labelledby="examvraag">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-steel-600">
              <span>Module {getModule(q.moduleId)?.number} · {getModule(q.moduleId)?.short}</span>
            </div>
            {q.case && (
              <div className="rounded-xl border-l-4 border-accent bg-accent-50/60 px-4 py-3">
                <p className="eyebrow mb-1 text-accent-700">Casus</p>
                <RichText text={q.case} />
              </div>
            )}
            <h1 id="examvraag" ref={headingRef} tabIndex={-1} className="text-lg font-bold text-navy-900 outline-none">
              {q.prompt}
            </h1>
            <fieldset className="space-y-2">
              <legend className="sr-only">Kies één antwoord</legend>
              {q.options.map((o) => {
                const sel = exam.answers[q.id] === o.id
                return (
                  <label key={o.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 px-4 py-3 transition ${sel ? 'border-navy-600 bg-navy-50 ring-2 ring-navy-600/20' : 'border-line bg-white hover:border-navy-500'}`}>
                    <input
                      type="radio"
                      name={`exam-${q.id}`}
                      checked={sel}
                      onChange={() => patchActiveExam({ answers: { ...exam.answers, [q.id]: o.id } })}
                      className="mt-1 h-4 w-4 accent-navy-600"
                    />
                    <span>
                      <span className="mr-2 font-bold text-steel-600 uppercase">{o.id}</span>
                      {o.text}
                    </span>
                  </label>
                )
              })}
            </fieldset>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button type="button" className="btn-secondary" onClick={() => go(exam.current - 1)} disabled={exam.current === 0}>
                Vorige
              </button>
              <button
                type="button"
                className={`btn-ghost ${flagged ? 'text-accent-700' : ''}`}
                aria-pressed={flagged}
                onClick={() => {
                  const id = exam.questionIds[exam.current]
                  patchActiveExam({ flagged: flagged ? exam.flagged.filter((f) => f !== id) : [...exam.flagged, id] })
                }}
              >
                <Icon name="flag" size={18} /> {flagged ? 'Gemarkeerd' : 'Markeer'}
              </button>
              <span className="flex-1" />
              {exam.current < total - 1 ? (
                <button type="button" className="btn-primary" onClick={() => go(exam.current + 1)}>
                  Volgende
                </button>
              ) : (
                <button type="button" className="btn-primary" onClick={() => setConfirm(true)}>
                  Inleveren
                </button>
              )}
            </div>
          </article>
        ) : (
          <div className="card p-6">Deze vraag is niet meer beschikbaar.</div>
        )}

        <aside className="card p-4 lg:sticky lg:top-24 lg:self-start" aria-label="Vragenoverzicht">
          <p className="mb-2 text-sm font-bold text-navy-900">Overzicht</p>
          <ol className="grid grid-cols-8 gap-1.5 sm:grid-cols-10 lg:grid-cols-6">
            {exam.questionIds.map((id, i) => {
              const a = exam.answers[id] !== undefined
              const f = exam.flagged.includes(id)
              const cur = i === exam.current
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={cur ? 'step' : undefined}
                    aria-label={`Vraag ${i + 1}${a ? ', beantwoord' : ', niet beantwoord'}${f ? ', gemarkeerd' : ''}`}
                    className={`relative h-9 w-full rounded-lg text-xs font-bold transition ${cur ? 'ring-2 ring-navy-600 ring-offset-1' : ''} ${a ? 'bg-navy-600 text-white' : 'bg-navy-50 text-navy-900 hover:bg-navy-100'}`}
                  >
                    {i + 1}
                    {f && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-white" aria-hidden="true" />}
                  </button>
                </li>
              )
            })}
          </ol>
          <div className="mt-3 space-y-1 text-xs text-steel-600">
            <p>
              <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded bg-navy-600 align-middle" /> beantwoord
            </p>
            <p>
              <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-accent align-middle" /> gemarkeerd
            </p>
          </div>
        </aside>
      </div>

      <dialog ref={dialogRef} onClose={() => setConfirm(false)} className="m-auto w-[min(92vw,460px)] rounded-2xl p-0 backdrop:bg-ink/60" aria-labelledby="inlever-titel">
        <div className="space-y-3 p-6">
          <h2 id="inlever-titel" className="text-xl font-extrabold text-navy-900">
            Examen inleveren?
          </h2>
          {unanswered > 0 ? (
            <p className="rounded-lg bg-bad-50 px-3 py-2 text-bad">
              Let op: je hebt nog <strong>{unanswered}</strong> {unanswered === 1 ? 'vraag' : 'vragen'} niet beantwoord. Onbeantwoorde vragen tellen als fout.
            </p>
          ) : (
            <p>Je hebt alle vragen beantwoord.</p>
          )}
          {exam.flagged.length > 0 && <p className="text-sm text-steel-600">{exam.flagged.length} vragen zijn gemarkeerd.</p>}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setConfirm(false)} autoFocus>
              Terug naar examen
            </button>
            <button type="button" className="btn-primary" onClick={submit}>
              Definitief inleveren
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
