import type { ReactNode } from 'react'
import type { ReviewStatus, SourceRef } from '../content/schema'

export function Shield({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 80 93" width={size} height={(size * 93) / 80} aria-hidden="true" className="shrink-0">
      <path d="M40 0L80 18V49C80 71 62 86 40 93C18 86 0 71 0 49V18L40 0Z" fill="rgba(26,42,94,0.9)" />
      <path d="M40 5L75 21V49C75 69 60 82 40 88C20 82 5 69 5 49V21L40 5Z" fill="rgba(36,53,128,0.95)" />
      <path d="M40 13L68 26V49C68 65 55 76 40 81C25 76 12 65 12 49V26L40 13Z" fill="#2d4099" />
      <path d="M40 20L62 30V49C62 62 52 71 40 75C28 71 18 62 18 49V30L40 20Z" fill="#3550b8" />
      <text x="40" y="59" textAnchor="middle" fontFamily="Outfit,sans-serif" fontWeight="900" fontSize="22" fill="white" letterSpacing="2">
        JS
      </text>
    </svg>
  )
}

const statusLabel: Record<ReviewStatus, string> = {
  wacht_op_bron: 'Inhoud in juridische review',
  concept: 'Concept – juridische review',
  juridische_review_nodig: 'Juridische review nodig',
  goedgekeurd: 'Juridisch goedgekeurd',
  afgekeurd: 'Afgekeurd',
}

export function StatusBadge({ status, compact = false }: { status: ReviewStatus; compact?: boolean }) {
  const ok = status === 'goedgekeurd'
  const cls = ok ? 'bg-ok-50 text-ok border-ok/30' : status === 'afgekeurd' ? 'bg-bad-50 text-bad border-bad/30' : 'bg-accent-50 text-accent-700 border-accent/40'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-ok' : status === 'afgekeurd' ? 'bg-bad' : 'bg-accent'}`} aria-hidden="true" />
      {compact && !ok ? 'Concept' : statusLabel[status]}
    </span>
  )
}

/** Zichtbare melding dat inhoud nog niet juridisch is goedgekeurd. */
export function ReviewNotice({ status, note, kind = 'les' }: { status: ReviewStatus; note?: string; kind?: 'les' | 'vraag' }) {
  if (status === 'goedgekeurd') return null
  return (
    <div role="note" className="flex gap-3 rounded-xl border border-accent/40 bg-accent-50 px-4 py-3 text-sm text-text">
      <svg viewBox="0 0 24 24" width="20" height="20" className="mt-0.5 shrink-0 text-accent-700" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
      <div>
        <p className="font-bold text-accent-700">{statusLabel[status]}</p>
        <p className="mt-0.5 leading-snug">
          {status === 'wacht_op_bron'
            ? 'Voor dit onderdeel is nog geen gecontroleerde bron verwerkt. Er wordt daarom nog geen uitleg getoond.'
            : `Deze ${kind} is nieuw geschreven en nog niet juridisch gecontroleerd. Gebruik de inhoud als studiemateriaal, niet als juridisch advies.`}
        </p>
        {note && <p className="mt-1 text-steel-600">Reviewpunt: {note}</p>}
      </div>
    </div>
  )
}

/** Eenvoudige opmaak: alinea's (lege regel), regels met "- " als lijst, **vet**. */
export function RichText({ text, className = '' }: { text: string; className?: string }) {
  const blocks = text.split(/\n\s*\n/)
  return (
    <div className={`prose-jslf ${className}`}>
      {blocks.map((b, i) => {
        const lines = b.split('\n').filter((l) => l.trim() !== '')
        if (lines.length > 0 && lines.every((l) => /^\s*[-•]\s+/.test(l))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-•]\s+/, ''))}</li>
              ))}
            </ul>
          )
        }
        // gemengd blok: tekstregels + lijst
        const out: ReactNode[] = []
        let list: string[] = []
        const flush = () => {
          if (list.length) out.push(<ul key={`u${out.length}`}>{list.map((l, j) => <li key={j}>{inline(l)}</li>)}</ul>)
          list = []
        }
        for (const l of lines) {
          if (/^\s*[-•]\s+/.test(l)) list.push(l.replace(/^\s*[-•]\s+/, ''))
          else {
            flush()
            out.push(<p key={`p${out.length}`}>{inline(l)}</p>)
          }
        }
        flush()
        return <div key={i}>{out}</div>
      })}
    </div>
  )
}

function inline(s: string): ReactNode {
  const parts = s.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => (p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p))
}

export function formatRef(r: SourceRef): string {
  return [r.article, r.law].filter(Boolean).join(' ')
}

export function SourceList({ refs, title = 'Bron' }: { refs: SourceRef[]; title?: string }) {
  if (!refs.length) return null
  return (
    <div className="text-sm">
      <p className="eyebrow mb-1">{title}</p>
      <ul className="space-y-0.5">
        {refs.map((r, i) => (
          <li key={i} className="text-text">
            {formatRef(r)}
            {r.note && <span className="text-steel-600"> — {r.note}</span>}
            {r.verify && <span className="ml-1.5 rounded bg-accent-50 px-1.5 py-0.5 text-[11px] font-semibold text-accent-700">te controleren</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-navy-100" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="h-full rounded-full bg-gradient-to-r from-navy-600 to-navy-500 transition-[width] duration-500" style={{ width: `${v}%` }} />
    </div>
  )
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-6">
      {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
      <h1 className="text-2xl font-extrabold text-navy-900 sm:text-3xl">{title}</h1>
      {children && <div className="mt-2 max-w-3xl text-steel-600">{children}</div>}
    </div>
  )
}

export function ModuleNumber({ n, size = 'md' }: { n: number; size?: 'md' | 'lg' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-navy-800 to-navy-600 font-extrabold text-white ${size === 'lg' ? 'h-14 w-14 text-xl' : 'h-10 w-10 text-base'}`}
      aria-hidden="true"
    >
      {n}
    </span>
  )
}

export function levelName(l: 'K' | 'B' | 'T') {
  return l === 'K' ? 'Kennis' : l === 'B' ? 'Begrip' : 'Toepassen'
}
