import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { Shield } from './ui'
import { curriculum } from '../content'

const nav = [
  { to: '/', label: 'Overzicht', icon: 'home', end: true },
  { to: '/leren', label: 'Leren', icon: 'book' },
  { to: '/oefenen', label: 'Oefenen', icon: 'target' },
  { to: '/proefexamen', label: 'Proefexamen', icon: 'clock' },
  { to: '/kennisbank', label: 'Kennisbank', icon: 'search' },
] as const

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const p: Record<string, string> = {
    home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    book: 'M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5zM4 19.5A1.5 1.5 0 0 0 5.5 21H20M8 7h8',
    target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-13v4.5l3 2',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm10 2-4.3-4.3',
    arrow: 'M5 12h14m-6-6 6 6-6 6',
    back: 'M19 12H5m6 6-6-6 6-6',
    check: 'M20 6 9 17l-5-5',
    flag: 'M5 21V4m0 0h11l-2 4 2 4H5',
    menu: 'M4 6h16M4 12h16M4 18h16',
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      <path d={p[name]} />
    </svg>
  )
}

export function Layout() {
  const loc = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const inExam = loc.pathname.startsWith('/proefexamen/bezig')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [loc.pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#inhoud" className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-bold text-navy-900 focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Naar de inhoud
      </a>
      <header className="relative overflow-hidden bg-ink text-white">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-navy-800/70 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <NavLink to="/" className="flex items-center gap-3 rounded-lg" aria-label="JS Legal Force – naar het overzicht">
            <Shield size={34} />
            <span className="leading-tight">
              <span className="block text-[15px] font-extrabold tracking-tight">JS Legal Force</span>
              <span className="block text-[11px] font-semibold tracking-[0.14em] text-steel uppercase">PHB Wet- en Regelgeving · Domein I</span>
            </span>
          </NavLink>
          {!inExam && (
            <nav aria-label="Hoofdmenu" className="ml-auto hidden md:block">
              <ul className="flex items-center gap-1">
                {nav.map((n) => (
                  <li key={n.to}>
                    <NavLink
                      to={n.to}
                      end={'end' in n}
                      className={({ isActive }) =>
                        `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-white/12 text-white shadow-[inset_0_-2px_0_var(--color-accent)]' : 'text-white/75 hover:bg-white/8 hover:text-white'}`
                      }
                    >
                      {n.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </header>

      <main id="inhoud" ref={mainRef} tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 outline-none sm:px-6 sm:pt-8 md:pb-12">
        <Outlet />
      </main>

      <footer className="no-print border-t border-line bg-white pb-20 md:pb-0">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 text-xs text-steel-600 sm:px-6">
          <span>© JS Legal Force · versie {curriculum.version} · juridische peildatum {formatDate(curriculum.peildatum)}</span>
          <span>Eigen oefenmateriaal, geen officiële examenvragen.</span>
          <NavLink to="/docent" className="font-semibold text-navy-700 underline-offset-2 hover:underline">
            Docent en redactie
          </NavLink>
          <NavLink to="/over" className="font-semibold text-navy-700 underline-offset-2 hover:underline">
            Over deze cursus
          </NavLink>
        </div>
      </footer>

      {!inExam && (
        <nav aria-label="Hoofdmenu mobiel" className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 backdrop-blur md:hidden">
          <ul className="grid grid-cols-5">
            {nav.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  end={'end' in n}
                  className={({ isActive }) => `flex flex-col items-center gap-0.5 px-1 py-2 text-[11px] font-semibold ${isActive ? 'text-accent' : 'text-white/70'}`}
                >
                  <Icon name={n.icon} />
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}

export function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}
