import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { allLessons, allQuestions, curriculum, getModule } from '../content'
import type { ReviewStatus } from '../content/schema'
import { buildOfficialExam } from '../lib/exam'
import { PageHeader, StatusBadge } from '../components/ui'

const statuses: ReviewStatus[] = ['goedgekeurd', 'juridische_review_nodig', 'concept', 'wacht_op_bron']

export function Docent() {
  const [filter, setFilter] = useState<'review' | 'alle'>('review')
  const official = useMemo(() => buildOfficialExam(curriculum, allQuestions), [])
  const count = (list: { reviewStatus: ReviewStatus }[], s: ReviewStatus) => list.filter((x) => x.reviewStatus === s).length
  const reviewItems = [
    ...allLessons.map((l) => ({ kind: 'Les', id: l.id, title: l.title, moduleId: l.moduleId, status: l.reviewStatus, note: l.reviewNote, link: `/les/${l.id}`, verify: l.sourceRefs.some((r) => r.verify) })),
    ...allQuestions.map((q) => ({ kind: 'Vraag', id: q.id, title: q.prompt, moduleId: q.moduleId, status: q.reviewStatus, note: q.reviewNote, link: q.lessonId ? `/les/${q.lessonId}` : `/leren/${q.moduleId}`, verify: q.sourceRefs.some((r) => r.verify) })),
  ].filter((x) => (filter === 'alle' ? true : x.status === 'juridische_review_nodig' || x.verify))

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Docent en redactie" title="Inhoudsstatus en beheer">
        Overzicht van wat juridisch is goedgekeurd en wat nog gecontroleerd moet worden. Inhoud wijzigen gaat via de JSON-bestanden in <code className="rounded bg-navy-50 px-1">src/content/</code> (zie docs/CONTENT_HANDLEIDING.md); er hoeft geen code te worden aangepast.
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat title="Lessen" total={allLessons.length} rows={statuses.map((s) => [s, count(allLessons, s)])} />
        <Stat title="Vragen" total={allQuestions.length} rows={statuses.map((s) => [s, count(allQuestions, s)])} />
        <div className="card p-5">
          <h2 className="font-bold text-navy-900">Toetsmatrijs</h2>
          <p className="mt-1 text-sm">
            Status: <strong>{curriculum.matrix.status === 'ingelezen' ? 'ingelezen' : 'bron ontbreekt'}</strong>
          </p>
          <p className="text-sm">Officiële examentermen: {curriculum.terms.length}</p>
          <p className="text-sm">Examengroepen: {curriculum.examGroups.length}</p>
          <p className="mt-2 text-sm">
            Officieel proefexamen: <strong className={official.ok ? 'text-ok' : 'text-bad'}>{official.ok ? 'vrijgegeven' : 'geblokkeerd'}</strong>
          </p>
          <p className="mt-2 text-xs text-steel-600">{curriculum.matrix.note}</p>
        </div>
      </div>

      <section className="card p-5 sm:p-6" aria-labelledby="per-module">
        <h2 id="per-module" className="mb-3 text-lg font-bold text-navy-900">
          Per module
        </h2>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tabel per module, horizontaal scrollbaar">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs text-steel-600 uppercase">
              <tr>
                <th className="py-2">Module</th>
                <th className="py-2">PHB-termen</th>
                <th className="py-2">Lessen</th>
                <th className="py-2">Vragen</th>
                <th className="py-2">Meerkeuze</th>
                <th className="py-2">Goedgekeurd</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {curriculum.modules.map((m) => {
                const qs = allQuestions.filter((q) => q.moduleId === m.id)
                return (
                  <tr key={m.id}>
                    <td className="py-2 font-semibold">
                      {m.number}. {m.title}
                    </td>
                    <td className="py-2">{m.termRange}</td>
                    <td className="py-2">{allLessons.filter((l) => l.moduleId === m.id).length}</td>
                    <td className="py-2">{qs.length}</td>
                    <td className="py-2">{qs.filter((q) => q.type === 'mc').length}</td>
                    <td className="py-2">{qs.filter((q) => q.reviewStatus === 'goedgekeurd').length}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card p-5 sm:p-6" aria-labelledby="reviewlijst">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 id="reviewlijst" className="flex-1 text-lg font-bold text-navy-900">
            Reviewlijst
          </h2>
          <label className="text-sm">
            <span className="mr-2 font-semibold">Toon</span>
            <select className="rounded-lg border border-line px-2 py-1.5" value={filter} onChange={(e) => setFilter(e.target.value as 'review' | 'alle')}>
              <option value="review">Specifieke reviewpunten</option>
              <option value="alle">Alle lessen en vragen</option>
            </select>
          </label>
        </div>
        <p className="mb-3 text-sm text-steel-600">{reviewItems.length} onderdelen. Alle inhoud is nieuw geschreven en nog niet juridisch goedgekeurd; hieronder staan eerst de onderdelen met een concreet controlepunt.</p>
        <ul className="divide-y divide-line">
          {reviewItems.map((x) => (
            <li key={x.id} className="py-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-steel-600">
                <span className="font-semibold text-navy-900">{x.kind}</span>
                <span>Module {getModule(x.moduleId)?.number}</span>
                <code>{x.id}</code>
                <StatusBadge status={x.status} />
              </div>
              <Link to={x.link} className="mt-0.5 block font-semibold text-navy-700 hover:underline">
                {x.title}
              </Link>
              {x.note && <p className="mt-0.5 text-sm">{x.note}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Stat({ title, total, rows }: { title: string; total: number; rows: [ReviewStatus, number][] }) {
  return (
    <div className="card p-5">
      <h2 className="font-bold text-navy-900">
        {title} <span className="text-steel-600">({total})</span>
      </h2>
      <ul className="mt-2 space-y-1.5">
        {rows.map(([s, n]) => (
          <li key={s} className="flex items-center justify-between gap-2 text-sm">
            <StatusBadge status={s} />
            <strong>{n}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
