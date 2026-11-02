import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { allQuestions, curriculum } from '../content'
import { buildConceptExam, buildOfficialExam, passMarkFor, type ExamPlan } from '../lib/exam'
import { setActiveExam, useProgress } from '../lib/progress'
import { Icon } from '../components/Layout'
import { PageHeader } from '../components/ui'

export function ExamIntro() {
  const p = useProgress()
  const nav = useNavigate()
  const official = useMemo(() => buildOfficialExam(curriculum, allQuestions), [])
  const concept = useMemo(() => buildConceptExam(curriculum, allQuestions), [])
  const { totalQuestions, durationMinutes, passPercentage } = curriculum.exam
  const passMark = passMarkFor(totalQuestions, passPercentage)

  const start = (mode: 'officieel' | 'concept') => {
    // opnieuw samenstellen bij elke start, zodat elke poging andere vragen krijgt
    const plan = (mode === 'officieel' ? buildOfficialExam(curriculum, allQuestions) : buildConceptExam(curriculum, allQuestions)) as ExamPlan
    if (!plan.ok) return
    const now = Date.now()
    setActiveExam({ mode, questionIds: plan.questionIds, answers: {}, flagged: [], current: 0, startedAt: now, deadline: now + durationMinutes * 60_000 })
    nav('/proefexamen/bezig')
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Proefexamen" title="Proefexamen Wet- en Regelgeving Domein I">
        Oefen onder examenomstandigheden. De oefenvragen zijn eigen materiaal van JS Legal Force en geen officiële examenvragen.
      </PageHeader>

      {p.activeExam && (
        <div className="card flex flex-col gap-3 border-navy-500 p-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h2 className="font-bold text-navy-900">Je hebt een proefexamen openstaan</h2>
            <p className="text-sm text-steel-600">De klok loopt door, ook als je de pagina sluit.</p>
          </div>
          <Link to="/proefexamen/bezig" className="btn-primary">
            Ga verder
          </Link>
          <button type="button" className="btn-secondary" onClick={() => setActiveExam(undefined)}>
            Stoppen zonder uitslag
          </button>
        </div>
      )}

      <section className="card p-5 sm:p-6" aria-labelledby="regels">
        <h2 id="regels" className="mb-3 text-lg font-bold text-navy-900">
          Examenvoorwaarden
        </h2>
        <dl className="grid gap-3 sm:grid-cols-3">
          <Fact label="Vragen" value={`${totalQuestions} gesloten vragen`} />
          <Fact label="Tijd" value={`${durationMinutes} minuten`} />
          <Fact label="Geslaagd vanaf" value={`${passPercentage}% (${passMark} van ${totalQuestions} goed)`} />
        </dl>
        <ul className="mt-4 space-y-1.5 text-sm text-text">
          <li>· Je kunt vrij heen en weer bladeren en vragen markeren om later terug te komen.</li>
          <li>· Je krijgt een waarschuwing als je inlevert met onbeantwoorde vragen.</li>
          <li>· Is de tijd om, dan wordt het examen automatisch ingeleverd.</li>
          <li>· Na afloop zie je je score per module en onderwerp, en de uitleg bij iedere vraag.</li>
        </ul>
        <p className="mt-3 text-xs text-steel-600">Bron examenvoorwaarden: {curriculum.exam.source}</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card flex flex-col p-5 sm:p-6" aria-labelledby="officieel">
          <div className="mb-2 flex items-center gap-2">
            <h2 id="officieel" className="text-lg font-bold text-navy-900">
              Officieel proefexamen
            </h2>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${official.ok ? 'bg-ok-50 text-ok' : 'bg-navy-100 text-navy-900'}`}>{official.ok ? 'Beschikbaar' : 'Nog niet beschikbaar'}</span>
          </div>
          <p className="text-sm text-steel-600">Volgt exact de verdeling van de PHB-toetsmatrijs en gebruikt alleen juridisch goedgekeurde vragen.</p>
          {!official.ok && (
            <div className="mt-3 rounded-xl bg-navy-50 px-4 py-3 text-sm" role="status">
              <p className="font-semibold text-navy-900">Waarom is dit examen nog niet beschikbaar?</p>
              <ul className="mt-1 space-y-1">
                {official.reasons.map((r) => (
                  <li key={r}>· {r}</li>
                ))}
              </ul>
              <p className="mt-2 text-steel-600">We bieden bewust geen examen aan met herhaalde of niet-gecontroleerde vragen onder deze naam.</p>
            </div>
          )}
          <div className="mt-auto pt-4">
            <button type="button" className="btn-primary" disabled={!official.ok || !!p.activeExam} onClick={() => start('officieel')}>
              Start officieel proefexamen
            </button>
          </div>
        </section>

        <section className="card flex flex-col border-accent/50 p-5 sm:p-6" aria-labelledby="concept">
          <div className="mb-2 flex items-center gap-2">
            <h2 id="concept" className="text-lg font-bold text-navy-900">
              Conceptproefexamen
            </h2>
            <span className="rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-semibold text-accent-700">Concept</span>
          </div>
          <p className="text-sm text-steel-600">
            Zelfde vorm en tijd, met {totalQuestions} unieke meerkeuzevragen uit alle modules, naar rato van de omvang per module. Let op: de vragen zijn nog niet allemaal juridisch gecontroleerd en de verdeling volgt nog niet de officiële toetsmatrijs.
          </p>
          {!concept.ok && (
            <div className="mt-3 rounded-xl bg-navy-50 px-4 py-3 text-sm" role="status">
              {concept.reasons.map((r) => (
                <p key={r}>{r}</p>
              ))}
            </div>
          )}
          <div className="mt-auto pt-4">
            <button type="button" className="btn-primary" disabled={!concept.ok || !!p.activeExam} onClick={() => start('concept')}>
              Start conceptproefexamen <Icon name="arrow" size={18} />
            </button>
          </div>
        </section>
      </div>

      {p.exams.length > 0 && (
        <section className="card p-5 sm:p-6" aria-labelledby="eerder">
          <h2 id="eerder" className="mb-3 text-lg font-bold text-navy-900">
            Eerdere pogingen
          </h2>
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-steel-600 uppercase">
              <tr>
                <th className="py-2 font-semibold">Datum</th>
                <th className="py-2 font-semibold">Soort</th>
                <th className="py-2 font-semibold">Score</th>
                <th className="py-2 font-semibold">Uitslag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {p.exams.map((e) => (
                <tr key={e.at}>
                  <td className="py-2">{new Date(e.at).toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td className="py-2">{e.mode === 'concept' ? 'Concept' : 'Officieel'}</td>
                  <td className="py-2 font-semibold">
                    {e.correct}/{e.total}
                  </td>
                  <td className={`py-2 font-semibold ${e.passed ? 'text-ok' : 'text-bad'}`}>{e.passed ? 'Voldoende' : 'Onvoldoende'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/proefexamen/uitslag" className="btn-secondary mt-4">
            Laatste uitslag bekijken
          </Link>
        </section>
      )}
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-navy-50 px-4 py-3">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-0.5 font-bold text-navy-900">{value}</dd>
    </div>
  )
}
