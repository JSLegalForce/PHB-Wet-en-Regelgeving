import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { curriculum, practiceQuestions, approvedQuestions } from '../content'
import { useProgress, wrongQuestionIds } from '../lib/progress'
import { Icon } from '../components/Layout'
import { PageHeader, ProgressBar } from '../components/ui'

export function Practice() {
  const p = useProgress()
  const nav = useNavigate()
  const [moduleId, setModuleId] = useState('alle')
  const [topic, setTopic] = useState('alle')
  const [aantal, setAantal] = useState('10')
  const wrong = wrongQuestionIds(p).filter((id) => practiceQuestions.some((q) => q.id === id))

  const topics = useMemo(() => {
    const qs = practiceQuestions.filter((q) => moduleId === 'alle' || q.moduleId === moduleId)
    return [...new Set(qs.map((q) => q.topic))].sort((a, b) => a.localeCompare(b, 'nl'))
  }, [moduleId])

  const available = practiceQuestions.filter((q) => (moduleId === 'alle' || q.moduleId === moduleId) && (topic === 'alle' || q.topic === topic)).length

  const start = (e: React.FormEvent) => {
    e.preventDefault()
    const sp = new URLSearchParams()
    if (moduleId !== 'alle') sp.set('module', moduleId)
    if (topic !== 'alle') sp.set('onderwerp', topic)
    sp.set('aantal', aantal)
    nav(`/oefenen/sessie?${sp}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Oefenen" title="Oefenen met directe uitleg">
        Kies een module of onderwerp. Na elk antwoord zie je waarom het goed of fout is, met de wettelijke grondslag. Beschikbaar: {practiceQuestions.length} oefenvragen, waarvan {approvedQuestions.length} juridisch goedgekeurd.
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <form onSubmit={start} className="card space-y-4 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-navy-900">Stel je oefensessie samen</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Module</span>
              <select
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5"
                value={moduleId}
                onChange={(e) => {
                  setModuleId(e.target.value)
                  setTopic('alle')
                }}
              >
                <option value="alle">Alle modules</option>
                {curriculum.modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.number}. {m.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Onderwerp</span>
              <select className="w-full rounded-lg border border-line bg-white px-3 py-2.5" value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="alle">Alle onderwerpen</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <fieldset>
            <legend className="mb-1 text-sm font-semibold">Aantal vragen</legend>
            <div className="flex flex-wrap gap-2">
              {['10', '20', 'alle'].map((a) => (
                <label key={a} className={`cursor-pointer rounded-lg border-2 px-4 py-2 font-semibold ${aantal === a ? 'border-navy-600 bg-navy-50' : 'border-line'}`}>
                  <input type="radio" name="aantal" value={a} checked={aantal === a} onChange={() => setAantal(a)} className="sr-only" />
                  {a === 'alle' ? 'Alle' : a}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn-primary" disabled={available === 0}>
              Start oefenen <Icon name="arrow" size={18} />
            </button>
            <span className="text-sm text-steel-600">{available} vragen in deze selectie</span>
          </div>
        </form>

        <div className="card space-y-3 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-navy-900">Foute vragen herhalen</h2>
          <p className="text-steel-600">Vragen die je de laatste keer fout had, komen hier terug tot je ze goed beantwoordt.</p>
          {wrong.length ? (
            <Link to="/oefenen/sessie?modus=fout" className="btn-primary">
              Herhaal {wrong.length} {wrong.length === 1 ? 'vraag' : 'vragen'}
            </Link>
          ) : (
            <p className="rounded-lg bg-navy-50 px-3 py-2 text-sm">Je hebt op dit moment geen foute vragen openstaan.</p>
          )}
        </div>
      </div>

      <section className="card p-5 sm:p-6" aria-labelledby="per-module">
        <h2 id="per-module" className="mb-1 text-lg font-bold text-navy-900">
          Voortgang per module en onderwerp
        </h2>
        <p className="mb-4 text-sm text-steel-600">
          Percentage vragen dat je bij de laatste poging goed had. Per officiële examenterm wordt dit getoond zodra de examentermen uit de toetsmatrijs zijn gekoppeld.
        </p>
        <ul className="divide-y divide-line">
          {curriculum.modules.map((m) => {
            const qs = practiceQuestions.filter((q) => q.moduleId === m.id)
            const done = qs.filter((q) => p.answers[q.id])
            const good = done.filter((q) => p.answers[q.id].lastCorrect).length
            const tps = [...new Set(qs.map((q) => q.topic))]
            return (
              <li key={m.id} className="py-3">
                <details>
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3">
                    <span className="min-w-0 flex-1 font-semibold">
                      {m.number}. {m.title}
                    </span>
                    <span className="text-xs text-steel-600">
                      {done.length}/{qs.length} gemaakt
                    </span>
                    <span className="flex w-40 items-center gap-2">
                      <ProgressBar value={done.length ? (good / done.length) * 100 : 0} label={`Score module ${m.number}`} />
                      <span className="w-9 text-right text-xs font-bold">{done.length ? Math.round((good / done.length) * 100) + '%' : '–'}</span>
                    </span>
                  </summary>
                  <ul className="mt-2 space-y-1 pl-4 text-sm">
                    {tps.map((t) => {
                      const tq = qs.filter((q) => q.topic === t)
                      const td = tq.filter((q) => p.answers[q.id])
                      const tg = td.filter((q) => p.answers[q.id].lastCorrect).length
                      return (
                        <li key={t} className="flex items-center gap-3">
                          <span className="flex-1">{t}</span>
                          <span className="text-xs text-steel-600">{td.length ? `${tg}/${td.length} goed` : 'nog niet geoefend'}</span>
                          <Link to={`/oefenen/sessie?module=${m.id}&onderwerp=${encodeURIComponent(t)}&aantal=alle`} className="text-xs font-semibold text-navy-700 hover:underline">
                            Oefen
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </details>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
