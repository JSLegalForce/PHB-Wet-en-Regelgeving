import { Link, Navigate } from 'react-router-dom'
import type { McQuestion } from '../content/schema'
import { curriculum, getModule, getQuestion } from '../content'
import { passMarkFor, scoreExam } from '../lib/exam'
import { useProgress } from '../lib/progress'
import { ProgressBar, ReviewNotice, RichText, SourceList } from '../components/ui'

export function ExamResultPage() {
  const p = useProgress()
  const rec = p.exams[0]
  if (!rec) return <Navigate to="/proefexamen" replace />
  const qs = rec.questionIds.map((id) => getQuestion(id)).filter((q): q is McQuestion => !!q && q.type === 'mc')
  const r = scoreExam(qs, rec.answers, curriculum.exam.passPercentage)
  const passMark = passMarkFor(r.total, curriculum.exam.passPercentage)
  const topics = Object.entries(r.byTopic)
    .map(([k, v]) => ({ module: k.split('|')[0], topic: k.split('|')[1], ...v }))
    .sort((a, b) => a.correct / a.total - b.correct / b.total)
  const weak = topics.filter((t) => t.correct / t.total < 0.7)

  return (
    <div className="space-y-6">
      <section className={`relative overflow-hidden rounded-3xl px-6 py-8 text-white sm:px-10 ${r.passed ? 'bg-gradient-to-br from-navy-900 to-navy-600' : 'bg-ink'}`}>
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative">
          <p className="text-xs font-bold tracking-[0.2em] text-steel uppercase">{rec.mode === 'concept' ? 'Uitslag conceptproefexamen' : 'Uitslag proefexamen'}</p>
          <h1 className="mt-2 text-4xl font-extrabold">
            {r.correct} van {r.total} goed
          </h1>
          <p className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-bold ${r.passed ? 'bg-ok text-white' : 'bg-bad text-white'}`}>{r.passed ? 'Voldoende' : 'Onvoldoende'}</p>
          <p className="mt-3 text-white/80">
            Cesuur: {passMark} van {r.total} goed ({curriculum.exam.passPercentage}%). {r.unanswered > 0 && `${r.unanswered} vragen niet beantwoord.`}
          </p>
          {rec.mode === 'concept' && <p className="mt-2 max-w-2xl text-sm text-white/70">Dit was een conceptproefexamen: de vragen zijn nog niet allemaal juridisch gecontroleerd en de verdeling volgt nog niet de officiële toetsmatrijs.</p>}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5 sm:p-6" aria-labelledby="per-module">
          <h2 id="per-module" className="mb-3 text-lg font-bold text-navy-900">
            Score per module
          </h2>
          <ul className="space-y-2.5">
            {curriculum.modules
              .filter((m) => r.byModule[m.id])
              .map((m) => {
                const v = r.byModule[m.id]
                return (
                  <li key={m.id} className="grid grid-cols-[minmax(0,1fr)_120px_48px] items-center gap-3 text-sm">
                    <span className="truncate">
                      {m.number}. {m.title}
                    </span>
                    <ProgressBar value={(v.correct / v.total) * 100} label={`Score module ${m.number}`} />
                    <span className="text-right font-bold">
                      {v.correct}/{v.total}
                    </span>
                  </li>
                )
              })}
          </ul>
        </section>
        <section className="card p-5 sm:p-6" aria-labelledby="aandacht">
          <h2 id="aandacht" className="mb-3 text-lg font-bold text-navy-900">
            Hier valt winst te behalen
          </h2>
          {weak.length === 0 ? (
            <p className="text-steel-600">Je scoorde op alle onderwerpen 70% of hoger.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {weak.slice(0, 8).map((t) => (
                <li key={t.module + t.topic} className="flex items-center gap-3">
                  <span className="flex-1">
                    <strong className="text-navy-900">{t.topic}</strong>
                    <span className="text-steel-600"> · module {getModule(t.module)?.number}</span>
                  </span>
                  <span className="font-semibold text-bad">
                    {t.correct}/{t.total}
                  </span>
                  <Link to={`/leren/${t.module}`} className="text-xs font-semibold text-navy-700 hover:underline">
                    Leren
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/oefenen/sessie?modus=fout" className="btn-primary">
              Oefen je foute vragen
            </Link>
            <Link to="/proefexamen" className="btn-secondary">
              Nieuw proefexamen
            </Link>
          </div>
        </section>
      </div>

      <section aria-labelledby="nakijken">
        <h2 id="nakijken" className="mb-3 text-lg font-bold text-navy-900">
          Nakijken
        </h2>
        <ol className="space-y-3">
          {qs.map((q, i) => {
            const a = rec.answers[q.id]
            const ok = a === q.correctAnswer
            const chosen = q.options.find((o) => o.id === a)
            const correct = q.options.find((o) => o.id === q.correctAnswer)!
            return (
              <li key={q.id}>
                <details className="card group">
                  <summary className="flex cursor-pointer list-none items-start gap-3 p-4">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${ok ? 'bg-ok' : 'bg-bad'}`}>{i + 1}</span>
                    <span className="flex-1">
                      <span className="block font-semibold text-navy-900">{q.prompt}</span>
                      <span className="text-xs text-steel-600">
                        {ok ? 'Goed' : a ? 'Fout' : 'Niet beantwoord'} · module {getModule(q.moduleId)?.number} · {q.topic}
                      </span>
                    </span>
                  </summary>
                  <div className="space-y-3 border-t border-line p-4 text-sm">
                    {q.case && <RichText text={q.case} className="text-steel-600" />}
                    {chosen && !ok && (
                      <p className="rounded-lg bg-bad-50 px-3 py-2">
                        <strong>Jouw antwoord ({chosen.id.toUpperCase()}):</strong> {chosen.text} — {chosen.feedback}
                      </p>
                    )}
                    <p className="rounded-lg bg-ok-50 px-3 py-2">
                      <strong>Juist ({correct.id.toUpperCase()}):</strong> {correct.text} — {correct.feedback}
                    </p>
                    <RichText text={q.explanation} />
                    <SourceList refs={q.sourceRefs} />
                    <ReviewNotice status={q.reviewStatus} note={q.reviewNote} kind="vraag" />
                  </div>
                </details>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
