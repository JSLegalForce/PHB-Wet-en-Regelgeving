import { Link } from 'react-router-dom'
import { curriculum, lessonsOf, questionsOf } from '../content'
import { lessonPercent, useProgress } from '../lib/progress'
import { ModuleNumber, PageHeader, ProgressBar } from '../components/ui'

export function Learn() {
  const p = useProgress()
  return (
    <div>
      <PageHeader eyebrow="Leren" title="Modules en lessen">
        De stof volgt de examentermen van de PHB-toetsmatrijs Domein I, verdeeld over elf herkenbare modules. Per les: leerdoelen, uitleg, wetsartikel, praktijkvoorbeeld, oefening en kennischeck.
      </PageHeader>
      <ol className="space-y-3">
        {curriculum.modules.map((m) => {
          const ls = lessonsOf(m.id)
          const pct = ls.length ? ls.reduce((s, l) => s + lessonPercent(p, l.id, l.screens.length), 0) / ls.length : 0
          const minutes = ls.reduce((s, l) => s + l.minutes, 0)
          return (
            <li key={m.id}>
              <Link to={`/leren/${m.id}`} className="card flex flex-col gap-4 p-5 transition hover:border-navy-500 sm:flex-row sm:items-center">
                <ModuleNumber n={m.number} size="lg" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-navy-900">{m.title}</h2>
                  <p className="text-sm text-steel-600">{m.topics.join(' · ')}</p>
                  <p className="mt-1 text-xs font-semibold text-steel-600">
                    PHB {m.termRange} · {ls.length} {ls.length === 1 ? 'les' : 'lessen'} · ca. {minutes} min · {questionsOf(m.id).length} vragen
                  </p>
                </div>
                <div className="flex w-full items-center gap-3 sm:w-48">
                  <ProgressBar value={pct} label={`Voortgang module ${m.number}`} />
                  <span className="w-10 text-right text-sm font-bold">{Math.round(pct)}%</span>
                </div>
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
