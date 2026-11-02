import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <h1 className="text-2xl font-extrabold text-navy-900">Pagina niet gevonden</h1>
      <p className="mt-2 text-steel-600">Deze pagina bestaat niet (meer).</p>
      <Link to="/" className="btn-primary mt-6">
        Naar het overzicht
      </Link>
    </div>
  )
}
