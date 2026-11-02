import { useId, useMemo, useState } from 'react'
import type { Question } from '../content/schema'
import { getModule } from '../content'
import { shuffle } from '../lib/random'
import { recordAnswer } from '../lib/progress'
import { levelName, ReviewNotice, RichText, SourceList, StatusBadge } from './ui'

interface Props {
  question: Question
  /** Wordt aangeroepen na controleren */
  onAnswered?: (correct: boolean) => void
  /** Laat moduleherkomst zien (bij oefenen over modules heen) */
  showModule?: boolean
  index?: { n: number; total: number }
}

export function QuestionCard({ question: q, onAnswered, showModule, index }: Props) {
  const [checked, setChecked] = useState<null | boolean>(null)
  const mod = getModule(q.moduleId)

  const finish = (ok: boolean) => {
    setChecked(ok)
    recordAnswer(q.id, ok)
    onAnswered?.(ok)
  }

  return (
    <article className="card overflow-hidden" aria-labelledby={`${q.id}-prompt`}>
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-navy-50/60 px-5 py-3 text-xs font-semibold text-steel-600">
        {index && (
          <span className="text-navy-900">
            Vraag {index.n} van {index.total}
          </span>
        )}
        {showModule && mod && <span>Module {mod.number} · {mod.short}</span>}
        <span>{q.topic}</span>
        <span className="rounded bg-white px-1.5 py-0.5 ring-1 ring-line" title={levelName(q.level)}>
          {levelName(q.level)}
        </span>
        <span className="ml-auto">
          <StatusBadge status={q.reviewStatus} compact />
        </span>
      </div>
      <div className="space-y-4 p-5 sm:p-6">
        {q.case && (
          <div className="rounded-xl border-l-4 border-accent bg-accent-50/60 px-4 py-3">
            <p className="eyebrow mb-1 text-accent-700">Praktijkcasus</p>
            <RichText text={q.case} />
          </div>
        )}
        <h3 id={`${q.id}-prompt`} className="text-lg font-bold leading-snug text-navy-900">
          {q.type === 'truefalse' ? <><span className="sr-only">Stelling: </span>{q.prompt}</> : q.prompt}
        </h3>
        {q.type === 'mc' && <Mc q={q} checked={checked} onCheck={finish} />}
        {q.type === 'truefalse' && <Tf q={q} checked={checked} onCheck={finish} />}
        {q.type === 'match' && <Match q={q} checked={checked} onCheck={finish} />}
        {q.type === 'order' && <Order q={q} checked={checked} onCheck={finish} />}
        {checked !== null && (
          <div className="space-y-3 border-t border-line pt-4" aria-live="polite">
            <div className="rounded-xl bg-navy-50 px-4 py-3">
              <p className="eyebrow mb-1">Toelichting</p>
              <RichText text={q.explanation} />
            </div>
            <SourceList refs={q.sourceRefs} />
            <ReviewNotice status={q.reviewStatus} note={q.reviewNote} kind="vraag" />
          </div>
        )}
      </div>
    </article>
  )
}

function Verdict({ ok, text }: { ok: boolean; text?: string }) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${ok ? 'border-ok/30 bg-ok-50' : 'border-bad/30 bg-bad-50'}`} role="status">
      <p className={`font-bold ${ok ? 'text-ok' : 'text-bad'}`}>{ok ? 'Goed!' : 'Niet goed.'}</p>
      {text && <p className="mt-0.5 leading-snug">{text}</p>}
    </div>
  )
}

function CheckButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button type="button" className="btn-primary" disabled={disabled} onClick={onClick}>
      Controleer antwoord
    </button>
  )
}

type Sub<T extends Question['type']> = { q: Extract<Question, { type: T }>; checked: null | boolean; onCheck: (ok: boolean) => void }

function Mc({ q, checked, onCheck }: Sub<'mc'>) {
  const [sel, setSel] = useState<string>()
  const name = useId()
  const correct = q.options.find((o) => o.id === q.correctAnswer)!
  return (
    <fieldset className="space-y-3">
      <legend className="sr-only">Kies één antwoord</legend>
      <div className="space-y-2">
        {q.options.map((o) => {
          const isSel = sel === o.id
          const show = checked !== null
          const state = show && o.id === q.correctAnswer ? 'ok' : show && isSel ? 'bad' : isSel ? 'sel' : 'none'
          const cls = {
            ok: 'border-ok bg-ok-50',
            bad: 'border-bad bg-bad-50',
            sel: 'border-navy-600 bg-navy-50 ring-2 ring-navy-600/20',
            none: 'border-line bg-white hover:border-navy-500',
          }[state]
          return (
            <label key={o.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 px-4 py-3 transition ${cls} ${show ? 'cursor-default' : ''}`}>
              <input type="radio" name={name} value={o.id} checked={isSel} disabled={show} onChange={() => setSel(o.id)} className="mt-1 h-4 w-4 accent-navy-600" />
              <span className="flex-1">
                <span className="mr-2 font-bold uppercase text-steel-600">{o.id}</span>
                {o.text}
                {show && (isSel || o.id === q.correctAnswer) && <span className="mt-1 block text-sm text-steel-600">{o.feedback}</span>}
              </span>
            </label>
          )
        })}
      </div>
      {checked === null ? (
        <CheckButton disabled={!sel} onClick={() => onCheck(sel === q.correctAnswer)} />
      ) : (
        <Verdict ok={checked} text={checked ? undefined : `Het juiste antwoord is ${correct.id.toUpperCase()}: ${correct.text}`} />
      )}
    </fieldset>
  )
}

function Tf({ q, checked, onCheck }: Sub<'truefalse'>) {
  const [sel, setSel] = useState<boolean>()
  const name = useId()
  return (
    <fieldset className="space-y-3">
      <legend className="sr-only">Is deze stelling juist of onjuist?</legend>
      <div className="grid grid-cols-2 gap-2 sm:max-w-md">
        {[true, false].map((v) => {
          const show = checked !== null
          const cls =
            show && v === q.correctAnswer ? 'border-ok bg-ok-50' : show && sel === v ? 'border-bad bg-bad-50' : sel === v ? 'border-navy-600 bg-navy-50 ring-2 ring-navy-600/20' : 'border-line bg-white hover:border-navy-500'
          return (
            <label key={String(v)} className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-bold ${cls}`}>
              <input type="radio" name={name} checked={sel === v} disabled={show} onChange={() => setSel(v)} className="h-4 w-4 accent-navy-600" />
              {v ? 'Juist' : 'Onjuist'}
            </label>
          )
        })}
      </div>
      {checked === null ? (
        <CheckButton disabled={sel === undefined} onClick={() => onCheck(sel === q.correctAnswer)} />
      ) : (
        <Verdict ok={checked} text={q.correctAnswer ? q.feedbackTrue : q.feedbackFalse} />
      )}
    </fieldset>
  )
}

function Match({ q, checked, onCheck }: Sub<'match'>) {
  const rights = useMemo(() => shuffle(q.pairs.map((p) => p.right)), [q])
  const [sel, setSel] = useState<Record<number, string>>({})
  const baseId = useId()
  const complete = q.pairs.every((_, i) => sel[i])
  const nGood = q.pairs.filter((p, i) => sel[i] === p.right).length
  return (
    <div className="space-y-3">
      <p className="text-sm text-steel-600">Kies bij ieder begrip de juiste omschrijving.</p>
      <div className="space-y-2">
        {q.pairs.map((p, i) => {
          const show = checked !== null
          const good = sel[i] === p.right
          return (
            <div key={i} className={`grid gap-2 rounded-xl border-2 px-4 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:items-center ${show ? (good ? 'border-ok bg-ok-50' : 'border-bad bg-bad-50') : 'border-line bg-white'}`}>
              <label htmlFor={`${baseId}-${i}`} className="font-semibold text-navy-900">
                {p.left}
              </label>
              <div>
                <select
                  id={`${baseId}-${i}`}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-text disabled:opacity-90"
                  value={sel[i] ?? ''}
                  disabled={show}
                  onChange={(e) => setSel({ ...sel, [i]: e.target.value })}
                >
                  <option value="">Kies…</option>
                  {rights.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {show && !good && <p className="mt-1 text-sm text-ok">Juist: {p.right}</p>}
              </div>
            </div>
          )
        })}
      </div>
      {checked === null ? (
        <CheckButton disabled={!complete} onClick={() => onCheck(nGood === q.pairs.length)} />
      ) : (
        <Verdict ok={checked} text={`${nGood} van de ${q.pairs.length} koppelingen goed.`} />
      )}
    </div>
  )
}

function Order({ q, checked, onCheck }: Sub<'order'>) {
  const [items, setItems] = useState(() => {
    let s = shuffle(q.items)
    // nooit al in de juiste volgorde beginnen
    for (let i = 0; i < 5 && s.every((x, j) => x === q.items[j]); i++) s = shuffle(q.items)
    return s
  })
  const [moved, setMoved] = useState('')
  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const n = [...items]
    ;[n[i], n[j]] = [n[j], n[i]]
    setItems(n)
    setMoved(`${n[j]} staat nu op plaats ${j + 1}.`)
  }
  const show = checked !== null
  return (
    <div className="space-y-3">
      <p className="text-sm text-steel-600">Zet de stappen in de juiste volgorde met de pijlknoppen.</p>
      <ol className="space-y-2">
        {items.map((it, i) => {
          const good = it === q.items[i]
          return (
            <li key={it} className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 ${show ? (good ? 'border-ok bg-ok-50' : 'border-bad bg-bad-50') : 'border-line bg-white'}`}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-sm font-bold text-navy-900">{i + 1}</span>
              <span className="flex-1">{it}</span>
              {!show && (
                <span className="flex gap-1">
                  <button type="button" className="btn-ghost h-9 w-9 p-0" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`${it} omhoog`}>
                    <Arrow up />
                  </button>
                  <button type="button" className="btn-ghost h-9 w-9 p-0" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`${it} omlaag`}>
                    <Arrow />
                  </button>
                </span>
              )}
            </li>
          )
        })}
      </ol>
      <p className="sr-only" aria-live="polite">
        {moved}
      </p>
      {show && !checked && (
        <div className="rounded-xl border border-line bg-white px-4 py-3 text-sm">
          <p className="eyebrow mb-1">Juiste volgorde</p>
          <ol className="list-decimal space-y-0.5 pl-5">
            {q.items.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        </div>
      )}
      {checked === null ? <CheckButton disabled={false} onClick={() => onCheck(items.every((x, i) => x === q.items[i]))} /> : <Verdict ok={checked} />}
    </div>
  )
}

function Arrow({ up = false }: { up?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: up ? 'rotate(180deg)' : undefined }}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
