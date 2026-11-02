import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { allGlossary, allLessons, curriculum, getModule } from '../content'
import { formatRef, PageHeader, StatusBadge } from '../components/ui'

interface ArticleHit {
  key: string
  label: string
  law: string
  lessons: { id: string; title: string; moduleId: string }[]
  verify: boolean
}

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function Kennisbank() {
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<'begrippen' | 'artikelen'>('begrippen')
  const [moduleId, setModuleId] = useState('alle')

  const articles = useMemo(() => {
    const map = new Map<string, ArticleHit>()
    for (const l of allLessons) {
      const refs = [...l.sourceRefs, ...l.screens.flatMap((s) => (s.type === 'law' ? [s.ref] : []))]
      for (const r of refs) {
        const key = `${r.law}|${r.article ?? ''}`
        const hit = map.get(key) ?? { key, label: formatRef(r), law: r.law, lessons: [], verify: false }
        if (!hit.lessons.some((x) => x.id === l.id)) hit.lessons.push({ id: l.id, title: l.title, moduleId: l.moduleId })
        hit.verify ||= !!r.verify
        map.set(key, hit)
      }
    }
    return [...map.values()].sort((a, b) => a.law.localeCompare(b.law, 'nl') || a.label.localeCompare(b.label, 'nl', { numeric: true }))
  }, [])

  const nq = normalize(q.trim())
  const terms = allGlossary.filter((g) => (moduleId === 'alle' || g.moduleId === moduleId) && (!nq || normalize(g.term + ' ' + g.definition).includes(nq)))
  const arts = articles.filter((a) => (moduleId === 'alle' || a.lessons.some((l) => l.moduleId === moduleId)) && (!nq || normalize(a.label + ' ' + a.lessons.map((l) => l.title).join(' ')).includes(nq)))
  const byLaw = arts.reduce<Record<string, ArticleHit[]>>((acc, a) => ((acc[a.law] ??= []).push(a), acc), {})

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Kennisbank" title="Begrippen en wetsartikelen">
        Zoek snel een begrip of artikel op en ga direct naar de les waarin het wordt uitgelegd.
      </PageHeader>

      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mb-1 block text-sm font-semibold">Zoeken</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Bijvoorbeeld: staande houden, toezichthouder, art. 5:20"
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5"
          />
        </label>
        <label className="block sm:w-72">
          <span className="mb-1 block text-sm font-semibold">Module</span>
          <select className="w-full rounded-lg border border-line bg-white px-3 py-2.5" value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
            <option value="alle">Alle modules</option>
            {curriculum.modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.number}. {m.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div role="tablist" aria-label="Kennisbank" className="flex gap-2">
        {(['begrippen', 'artikelen'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            id={`tab-${t}`}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 font-semibold ${tab === t ? 'bg-navy-900 text-white' : 'bg-white text-navy-900 ring-1 ring-line hover:bg-navy-50'}`}
          >
            {t === 'begrippen' ? `Begrippen (${terms.length})` : `Wetsartikelen (${arts.length})`}
          </button>
        ))}
      </div>

      {tab === 'begrippen' ? (
        <div role="tabpanel" id="panel-begrippen" aria-labelledby="tab-begrippen">
          {terms.length === 0 ? (
            <p className="text-steel-600">Geen begrippen gevonden.</p>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {terms.map((g) => (
                <li key={g.moduleId + g.term} className="card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="text-lg font-bold text-navy-900">{g.term}</h2>
                    <StatusBadge status={g.reviewStatus} compact />
                  </div>
                  <div className="mt-1 space-y-2">
                    <p className="leading-relaxed">{g.definition}</p>
                    <p className="text-xs text-steel-600">
                      Module {getModule(g.moduleId)?.number} · {getModule(g.moduleId)?.short}
                      {g.sourceRefs.length > 0 && ` · ${g.sourceRefs.map(formatRef).join('; ')}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div role="tabpanel" id="panel-artikelen" aria-labelledby="tab-artikelen" className="space-y-4">
          {Object.keys(byLaw).length === 0 && <p className="text-steel-600">Geen artikelen gevonden.</p>}
          {Object.entries(byLaw).map(([law, list]) => (
            <section key={law} className="card p-4 sm:p-5">
              <h2 className="mb-2 font-bold text-navy-900">{law}</h2>
              <ul className="divide-y divide-line">
                {list.map((a) => (
                  <li key={a.key} className="flex flex-col gap-1 py-2 sm:flex-row sm:items-baseline sm:gap-4">
                    <span className="font-semibold sm:w-44">
                      {a.label.replace(` ${law}`, '') || law}
                      {a.verify && <span className="ml-1.5 rounded bg-accent-50 px-1.5 py-0.5 text-[11px] font-semibold text-accent-700">te controleren</span>}
                    </span>
                    <span className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                      {a.lessons.map((l) => (
                        <Link key={l.id} to={`/les/${l.id}`} className="text-navy-700 hover:underline">
                          {getModule(l.moduleId)?.number}. {l.title}
                        </Link>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
      <p className="text-xs text-steel-600">De kennisbank geeft uitleg in eigen woorden en is geen juridisch advies. Raadpleeg voor de officiële tekst altijd wetten.overheid.nl of de APV van je gemeente.</p>
    </div>
  )
}
