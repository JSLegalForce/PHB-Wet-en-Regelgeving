import { Link, useParams } from 'react-router-dom'
import { getModule, lessonsOf, questionsOf } from '../content'
import { lessonPercent, useProgress } from '../lib/progress'
import { Icon } from '../components/Layout'
import { ModuleNumber, ProgressBar, ReviewNotice, StatusBadge } from '../components/ui'
import { NotFound } from './NotFound'

export function ModulePage() {
  const { moduleId = '' } = useParams()
  const m = getModule(moduleId)
  const p = useProgress()
  if (!m) return <NotFound />
  const ls = lessonsOf(m.id)
  const qs = questionsOf(m.id)

  return (
    <div className="space-y-6">
      <Link to="/leren" className="btn-ghost -ml-3">
        <Icon name="back" size={18} /> Alle modules
      </Link>
      <div className="flex items-start gap-4">
        <ModuleNumber n={m.number} size="lg" />
        <div>
          <p className="eyebrow">Module {m.number} · PHB {m.termRange}</p>
          <h1 className="text-2xl font-extrabold text-navy-900 sm:text-3xl">{m.title}</h1>
          <p className="mt-1 text-steel-600">{m.topics.join(' · ')}</p>
        </div>
      </div>

      {ls.length === 0 ? (
        <ReviewNotice status="wacht_op_bron" />
      ) : (
        <ol className="space-y-3">
          {ls.map((l) => {
            const pct = lessonPercent(p, l.id, l.screens.length)
            return (
              <li key={l.id}>
                <Link to={`/les/${l.id}`} className="card flex flex-col gap-3 p-5 transition hover:border-navy-500 sm:flex-row sm:items-center">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${pct === 100 ? 'bg-ok text-white' : 'bg-navy-100 text-navy-900'}`}>
                    {pct === 100 ? <Icon name="check" size={18} /> : l.order}
                    <span className="sr-only">{pct === 100 ? ' (afgerond)' : ''}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-navy-900">{l.title}</h2>
                    <p className="text-sm text-steel-600">{l.objectives.map((o) => o.text).slice(0, 2).join(' · ')}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-steel-600">
                      <span>ca. {l.minutes} min</span>
                      <StatusBadge status={l.reviewStatus} />
                    </div>
                  </div>
                  <div className="flex w-full items-center gap-3 sm:w-40">
                    <ProgressBar value={pct} label={`Voortgang les ${l.title}`} />
                    <span className="w-10 text-right text-sm font-bold">{pct}%</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>
      )}

      {qs.length > 0 && (
        <div className="card flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h2 className="font-bold text-navy-900">Oefenen met module {m.number}</h2>
            <p className="text-sm text-steel-600">{qs.length} vragen met directe uitleg.</p>
          </div>
          <Link to={`/oefenen/sessie?module=${m.id}`} className="btn-primary">
            Start oefenen
          </Link>
        </div>
      )}
    </div>
  )
}
