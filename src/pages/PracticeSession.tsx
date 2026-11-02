import { useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getModule, getQuestion, practiceQuestions } from '../content'
import { getProgress, wrongQuestionIds } from '../lib/progress'
import { shuffle } from '../lib/random'
import { QuestionCard } from '../components/QuestionCard'
import { Icon } from '../components/Layout'
import { ProgressBar } from '../components/ui'

export function PracticeSession() {
  const [sp] = useSearchParams()
  const mode = sp.get('modus')
  const moduleId = sp.get('module')
  const topic = sp.get('onderwerp')
  const aantal = sp.get('aantal') ?? '10'
  const [round, setRound] = useState(0)

  const ids = useMemo(() => {
    let pool: string[]
    if (mode === 'fout') pool = wrongQuestionIds(getProgress()).filter((id) => getQuestion(id))
    else pool = practiceQuestions.filter((q) => (!moduleId || q.moduleId === moduleId) && (!topic || q.topic === topic)).map((q) => q.id)
    const s = shuffle(pool)
    return aantal === 'alle' || mode === 'fout' ? s : s.slice(0, Number(aantal) || 10)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, moduleId, topic, aantal, round])

  const [i, setI] = useState(0)
  const [answered, setAnswered] = useState<Record<string, boolean>>({})
  const topRef = useRef<HTMLDivElement>(null)

  const title = mode === 'fout' ? 'Foute vragen herhalen' : topic ? topic : moduleId ? `Module ${getModule(moduleId)?.number} · ${getModule(moduleId)?.title}` : 'Alle modules'

  if (ids.length === 0) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <h1 className="text-xl font-extrabold text-navy-900">Geen vragen in deze selectie</h1>
        <Link to="/oefenen" className="btn-primary mt-6">
          Terug naar oefenen
        </Link>
      </div>
    )
  }

  const finished = i >= ids.length
  const good = Object.values(answered).filter(Boolean).length

  if (finished) {
    const wrongNow = ids.filter((id) => answered[id] === false)
    return (
      <div className="card mx-auto max-w-xl space-y-4 p-8 text-center">
        <p className="eyebrow">Oefensessie afgerond</p>
        <h1 className="text-2xl font-extrabold text-navy-900">
          {good} van {ids.length} goed
        </h1>
        <ProgressBar value={(good / ids.length) * 100} label="Score oefensessie" />
        <p className="text-steel-600">{wrongNow.length ? `${wrongNow.length} vragen staan klaar om te herhalen.` : 'Alles goed. Sterk!'}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {wrongNow.length > 0 && (
            <Link to="/oefenen/sessie?modus=fout" className="btn-primary" onClick={() => { setI(0); setAnswered({}); setRound((r) => r + 1) }}>
              Herhaal foute vragen
            </Link>
          )}
          <button type="button" className="btn-secondary" onClick={() => { setI(0); setAnswered({}); setRound((r) => r + 1) }}>
            Nieuwe ronde
          </button>
          <Link to="/oefenen" className="btn-ghost">
            Terug naar oefenen
          </Link>
        </div>
      </div>
    )
  }

  const q = getQuestion(ids[i])!
  return (
    <div className="mx-auto max-w-3xl space-y-4" ref={topRef}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/oefenen" className="btn-ghost -ml-3">
          <Icon name="back" size={18} /> Stoppen
        </Link>
        <p className="text-sm font-semibold text-steel-600">{title}</p>
      </div>
      <div className="flex items-center gap-3">
        <ProgressBar value={(i / ids.length) * 100} label="Voortgang oefensessie" />
        <span className="text-sm font-bold whitespace-nowrap">
          {i + 1}/{ids.length}
        </span>
      </div>
      <QuestionCard key={`${round}-${q.id}`} question={q} showModule index={{ n: i + 1, total: ids.length }} onAnswered={(ok) => setAnswered((a) => ({ ...a, [q.id]: ok }))} />
      <div className="flex justify-end">
        <button
          type="button"
          className="btn-primary"
          disabled={answered[q.id] === undefined}
          onClick={() => {
            setI(i + 1)
            window.scrollTo({ top: 0 })
          }}
        >
          {i + 1 < ids.length ? 'Volgende vraag' : 'Bekijk resultaat'}
        </button>
      </div>
    </div>
  )
}
