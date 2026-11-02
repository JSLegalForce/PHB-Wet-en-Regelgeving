import { Link } from 'react-router-dom'
import { allLessons, allQuestions, approvedQuestions, curriculum, getLesson, getModule, lessonsOf } from '../content'
import { lessonPercent, useProgress, wrongQuestionIds } from '../lib/progress'
import { Icon } from '../components/Layout'
import { ModuleNumber, ProgressBar, Shield } from '../components/ui'

export function Dashboard() {
  const p = useProgress()
  const done = allLessons.filter((l) => p.lessons[l.id]?.completed).length
  const overall = allLessons.length ? (done / allLessons.length) * 100 : 0
  const last = p.lastLessonId ? getLesson(p.lastLessonId) : undefined
  const nextUp = last && !p.lessons[last.id]?.completed ? last : allLessons.find((l) => !p.lessons[l.id]?.completed) ?? allLessons[0]
  const answered = Object.values(p.answers)
  const attempts = answered.reduce((s, a) => s + a.attempts, 0)
  const lastCorrectPct = answered.length ? Math.round((answered.filter((a) => a.lastCorrect).length / answered.length) * 100) : 0
  const wrong = wrongQuestionIds(p).length
  const lastExam = p.exams[0]

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-ink px-6 py-8 text-white sm:px-10 sm:py-10">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-20 -right-10 h-72 w-72 rounded-full bg-navy-600/50 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 h-52 w-52 rounded-full bg-accent/15 blur-3xl" aria-hidden="true" />
        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-steel uppercase">Permanente her- en bijscholing</p>
            <h1 className="mt-2 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">Wet- en Regelgeving Domein I</h1>
            <p className="mt-3 max-w-xl text-white/80">
              {curriculum.modules.length} modules met korte lessen, oefenvragen met uitleg en een proefexamen van {curriculum.exam.totalQuestions} vragen in {curriculum.exam.durationMinutes} minuten.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {nextUp && (
                <Link to={`/les/${nextUp.id}`} className="btn bg-white text-navy-900 shadow-lg hover:-translate-y-px">
                  {p.lastLessonId ? 'Verder leren' : 'Begin met leren'}
                  <Icon name="arrow" size={18} />
                </Link>
              )}
              <Link to="/oefenen" className="btn border border-white/25 bg-white/5 text-white hover:bg-white/10">
                Oefenen
              </Link>
            </div>
            {nextUp && (
              <p className="mt-3 text-sm text-white/65">
                {p.lastLessonId ? 'Laatst bezocht: ' : 'Eerste les: '}
                Module {getModule(nextUp.moduleId)?.number} · {nextUp.title}
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <Shield size={30} />
              <p className="font-bold">Jouw studievoortgang</p>
            </div>
            <p className="mt-4 text-4xl font-extrabold">{Math.round(overall)}%</p>
            <p className="text-sm text-white/70">
              {done} van {allLessons.length} lessen afgerond
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Totale voortgang" aria-valuenow={Math.round(overall)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-accent" style={{ width: `${overall}%` }} />
            </div>
            <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div>
                <dt className="text-[11px] text-white/60 uppercase">Beantwoord</dt>
                <dd className="text-lg font-bold">{attempts}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-white/60 uppercase">Laatst goed</dt>
                <dd className="text-lg font-bold">{answered.length ? `${lastCorrectPct}%` : '–'}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-white/60 uppercase">Proefexamen</dt>
                <dd className="text-lg font-bold">{lastExam ? `${lastExam.correct}/${lastExam.total}` : '–'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <QuickLink to="/oefenen/sessie?modus=fout" title="Foute vragen herhalen" text={wrong ? `${wrong} vragen om nog eens te doen` : 'Nog geen foute antwoorden'} icon="target" disabled={!wrong} />
        <QuickLink to="/proefexamen" title="Proefexamen" text={`${curriculum.exam.totalQuestions} vragen · ${curriculum.exam.durationMinutes} min · cesuur ${curriculum.exam.passPercentage}%`} icon="clock" />
        <QuickLink to="/kennisbank" title="Kennisbank" text="Begrippen en wetsartikelen opzoeken" icon="search" />
      </section>

      <section aria-labelledby="modules-titel">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="eyebrow">Studieoverzicht</p>
            <h2 id="modules-titel" className="text-xl font-extrabold text-navy-900">
              De {curriculum.modules.length} modules
            </h2>
          </div>
          <p className="text-sm text-steel-600">
            Inhoudsstatus: {allLessons.length} lessen · {allQuestions.length} vragen · <strong className="text-navy-900">{approvedQuestions.length} juridisch goedgekeurd</strong>
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {curriculum.modules.map((m) => {
            const ls = lessonsOf(m.id)
            const pct = ls.length ? ls.reduce((s, l) => s + lessonPercent(p, l.id, l.screens.length), 0) / ls.length : 0
            return (
              <li key={m.id}>
                <Link to={`/leren/${m.id}`} className="card group flex h-full flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:border-navy-500">
                  <div className="flex items-start gap-3">
                    <ModuleNumber n={m.number} />
                    <div className="min-w-0">
                      <h3 className="leading-snug font-bold text-navy-900 group-hover:text-navy-600">{m.title}</h3>
                      <p className="text-xs text-steel-600">
                        PHB {m.termRange} · {ls.length} {ls.length === 1 ? 'les' : 'lessen'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center gap-3">
                    <ProgressBar value={pct} label={`Voortgang module ${m.number}`} />
                    <span className="w-10 text-right text-xs font-bold text-navy-900">{Math.round(pct)}%</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <p className="rounded-xl border border-line bg-white px-4 py-3 text-sm text-steel-600">
        Je voortgang wordt alleen in deze browser bewaard. Op een andere computer of na het wissen van je browsergegevens begin je opnieuw. Er worden geen persoonsgegevens opgeslagen.
      </p>
    </div>
  )
}

function QuickLink({ to, title, text, icon, disabled }: { to: string; title: string; text: string; icon: string; disabled?: boolean }) {
  const inner = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
        <Icon name={icon} />
      </span>
      <span>
        <span className="block font-bold text-navy-900">{title}</span>
        <span className="block text-sm text-steel-600">{text}</span>
      </span>
    </>
  )
  if (disabled) return <div className="card flex items-center gap-3 p-4 opacity-70">{inner}</div>
  return (
    <Link to={to} className="card flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:border-navy-500">
      {inner}
    </Link>
  )
}
