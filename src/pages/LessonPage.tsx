import { useEffect, useRef } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import type { Lesson, Screen } from '../content/schema'
import { getLesson, getModule, getQuestion, nextLesson } from '../content'
import { markScreen, useProgress } from '../lib/progress'
import { Icon } from '../components/Layout'
import { QuestionCard } from '../components/QuestionCard'
import { formatRef, levelName, ProgressBar, ReviewNotice, RichText, SourceList, StatusBadge } from '../components/ui'
import { NotFound } from './NotFound'

function screenTitle(s: Screen): string {
  return s.title
}

export function LessonPage() {
  const { lessonId = '' } = useParams()
  const [sp, setSp] = useSearchParams()
  const lesson = getLesson(lessonId)
  const p = useProgress()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const total = lesson?.screens.length ?? 0
  const idx = Math.min(Math.max(0, Number(sp.get('scherm') ?? (p.lessons[lessonId]?.lastScreen ?? 0)) || 0), Math.max(0, total - 1))

  useEffect(() => {
    if (lesson) markScreen(lesson.id, idx, total)
  }, [lesson, idx, total])

  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    headingRef.current?.focus()
    window.scrollTo({ top: 0 })
  }, [idx])

  if (!lesson) return <NotFound />
  const mod = getModule(lesson.moduleId)!
  const screen = lesson.screens[idx]
  const seen = p.lessons[lesson.id]?.seen ?? []
  const go = (i: number) => setSp({ scherm: String(i) })
  const next = nextLesson(lesson.id)
  const pct = Math.round((seen.length / total) * 100)

  return (
    <div className="space-y-5">
      <nav aria-label="Kruimelpad" className="flex flex-wrap items-center gap-1 text-sm text-steel-600">
        <Link to="/leren" className="hover:text-navy-700 hover:underline">
          Leren
        </Link>
        <span aria-hidden="true">/</span>
        <Link to={`/leren/${mod.id}`} className="hover:text-navy-700 hover:underline">
          Module {mod.number} · {mod.short}
        </Link>
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">
            Les {lesson.order} · ca. {lesson.minutes} min
          </p>
          <h1 className="text-2xl font-extrabold text-navy-900 sm:text-3xl">{lesson.title}</h1>
        </div>
        <div className="flex items-center gap-3 sm:w-64">
          <ProgressBar value={pct} label="Voortgang in deze les" />
          <span className="text-sm font-bold whitespace-nowrap">
            {idx + 1}/{total}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <details className="card lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-bold text-navy-900">
              Onderdelen van deze les
              <Icon name="menu" size={18} />
            </summary>
            <ChapterNav lesson={lesson} idx={idx} seen={seen} go={go} className="border-t border-line" />
          </details>
          <ChapterNav lesson={lesson} idx={idx} seen={seen} go={go} className="card hidden lg:block" />
        </aside>

        <section aria-labelledby="scherm-titel" className="min-w-0 space-y-4">
          {(idx === 0 || screen.type === 'summary') && <ReviewNotice status={lesson.reviewStatus} note={lesson.reviewNote} />}
          <div className="card p-5 sm:p-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 id="scherm-titel" ref={headingRef} tabIndex={-1} className="text-xl font-extrabold text-navy-900 outline-none">
                {screenTitle(screen)}
              </h2>
              {idx !== 0 && <StatusBadge status={lesson.reviewStatus} compact />}
            </div>
            <ScreenView screen={screen} lesson={lesson} />
          </div>

          <div className="flex items-center justify-between gap-3">
            <button type="button" className="btn-secondary" onClick={() => go(idx - 1)} disabled={idx === 0}>
              Vorige
            </button>
            {idx < total - 1 ? (
              <button type="button" className="btn-primary" onClick={() => go(idx + 1)}>
                Volgende
              </button>
            ) : next ? (
              <Link to={`/les/${next.id}`} className="btn-primary">
                Volgende les
              </Link>
            ) : (
              <Link to="/proefexamen" className="btn-primary">
                Naar het proefexamen
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function ChapterNav({ lesson, idx, seen, go, className }: { lesson: Lesson; idx: number; seen: number[]; go: (i: number) => void; className?: string }) {
  return (
    <nav aria-label="Onderdelen van de les" className={className}>
      <ol className="p-2">
        {lesson.screens.map((s, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => go(i)}
              aria-current={i === idx ? 'step' : undefined}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition ${i === idx ? 'bg-navy-50 font-bold text-navy-900' : 'text-text hover:bg-navy-50/60'}`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${seen.includes(i) ? 'bg-ok text-white' : i === idx ? 'bg-navy-600 text-white' : 'bg-navy-100 text-navy-900'}`}
                aria-hidden="true"
              >
                {seen.includes(i) ? '✓' : i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate">{s.title}</span>
              {seen.includes(i) && <span className="sr-only">(bekeken)</span>}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function ScreenView({ screen: s, lesson }: { screen: Screen; lesson: Lesson }) {
  switch (s.type) {
    case 'objectives':
      return (
        <div className="space-y-4">
          <p className="text-steel-600">Na deze les kun je:</p>
          <ul className="space-y-2">
            {lesson.objectives.map((o, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-line px-4 py-3">
                <span className="mt-0.5 rounded-md bg-navy-100 px-2 py-0.5 text-xs font-bold text-navy-900" title={levelName(o.level)}>
                  {o.level}
                </span>
                <span>
                  {o.text}
                  <span className="sr-only"> (niveau {levelName(o.level)})</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-steel-600">K = kennis · B = begrip · T = toepassen</p>
        </div>
      )
    case 'text':
      return <RichText text={s.body} className="text-[17px]" />
    case 'law':
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-ink px-4 py-3 text-white">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="text-accent">
              <path d="M12 3v18M5 7h14M7 7l-3 7a3 3 0 0 0 6 0zm10 0-3 7a3 3 0 0 0 6 0z" />
            </svg>
            <span className="font-bold">{formatRef(s.ref)}</span>
            {s.ref.verify && <span className="rounded bg-accent px-1.5 py-0.5 text-[11px] font-bold text-ink">te controleren</span>}
          </div>
          <p className="eyebrow">In eigen woorden</p>
          <RichText text={s.body} className="text-[17px]" />
        </div>
      )
    case 'keypoints':
      return (
        <dl className="grid gap-3 sm:grid-cols-2">
          {s.items.map((it, i) => (
            <div key={i} className="rounded-xl border border-line bg-navy-50/50 px-4 py-3">
              <dt className="font-bold text-navy-900">{it.term}</dt>
              <dd className="mt-1 text-[15px] leading-relaxed">{it.text}</dd>
            </div>
          ))}
        </dl>
      )
    case 'example':
      return (
        <div className="rounded-xl border-l-4 border-accent bg-accent-50/60 px-5 py-4">
          <p className="eyebrow mb-2 text-accent-700">Uit de praktijk</p>
          <RichText text={s.body} className="text-[17px]" />
        </div>
      )
    case 'exercise': {
      const q = getQuestion(s.questionId)
      return q ? <QuestionCard key={q.id} question={q} /> : <ReviewNotice status="wacht_op_bron" />
    }
    case 'check': {
      const qs = s.questionIds.map(getQuestion).filter((q) => !!q)
      return (
        <div className="space-y-4">
          <p className="text-steel-600">Test of je de stof beheerst. Je krijgt direct uitleg bij elk antwoord.</p>
          {qs.map((q, i) => (
            <QuestionCard key={q.id} question={q} index={{ n: i + 1, total: qs.length }} />
          ))}
        </div>
      )
    }
    case 'summary':
      return (
        <div className="space-y-5">
          <ul className="space-y-2">
            {lesson.summary.map((t, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ok text-white">
                  <Icon name="check" size={13} />
                </span>
                <span className="leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-line pt-4">
            <SourceList refs={lesson.sourceRefs} title="Bronnen bij deze les" />
            <p className="mt-2 text-xs text-steel-600">
              Versie {lesson.version} · laatst gewijzigd {lesson.lastModified}
            </p>
          </div>
        </div>
      )
  }
}
