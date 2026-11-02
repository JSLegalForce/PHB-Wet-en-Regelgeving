import { curriculum } from '../content'
import { resetProgress } from '../lib/progress'
import { formatDate } from '../components/Layout'
import { PageHeader } from '../components/ui'

export function Over() {
  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader eyebrow="Over deze cursus" title="PHB Wet- en Regelgeving Domein I" />
      <section className="card space-y-3 p-5 sm:p-6">
        <h2 className="text-lg font-bold text-navy-900">Voor wie</h2>
        <p>Voor boa's in Domein I Openbare ruimte die zich voorbereiden op het PHB-examen Wet- en Regelgeving. De cursus volgt de onderwerpen van de PHB-toetsmatrijs Domein I, verdeeld over elf modules.</p>
        <p>
          Juridische peildatum: <strong>{formatDate(curriculum.peildatum)}</strong>. Versie {curriculum.version}.
        </p>
      </section>
      <section className="card space-y-3 p-5 sm:p-6">
        <h2 className="text-lg font-bold text-navy-900">Status van de inhoud</h2>
        <p>
          Bij elke les en vraag staat of de inhoud juridisch is goedgekeurd. Onderdelen met de aanduiding <em>concept</em> of <em>juridische review</em> zijn nieuw geschreven en worden nog gecontroleerd. Gebruik ze als studiemateriaal, niet als juridisch advies. Raadpleeg voor de officiële tekst altijd wetten.overheid.nl en de APV van je gemeente.
        </p>
        <p>De oefenvragen en proefexamens zijn eigen oefenmateriaal van JS Legal Force. Het zijn geen officiële examenvragen.</p>
      </section>
      <section className="card space-y-3 p-5 sm:p-6">
        <h2 className="text-lg font-bold text-navy-900">Privacy en voortgang</h2>
        <p>
          Je voortgang wordt alleen lokaal in deze browser bewaard (localStorage). Er worden geen namen, e-mailadressen of andere persoonsgegevens opgeslagen of verstuurd. Dit is daarom ook geen centrale leerlingregistratie: je docent kan je resultaten niet zien, en op een ander apparaat begin je opnieuw.
        </p>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            if (window.confirm('Weet je zeker dat je al je voortgang in deze browser wilt wissen?')) resetProgress()
          }}
        >
          Voortgang wissen
        </button>
      </section>
      <section className="card space-y-2 p-5 sm:p-6">
        <h2 className="text-lg font-bold text-navy-900">Contact</h2>
        <p>Gemeenten die zijn aangesloten bij de online leeromgeving en kennisbanken van JS Legal Force ontvangen deze e-learning. Andere gemeenten en boa-organisaties kunnen contact opnemen via info@jslegalforce.nl.</p>
      </section>
    </div>
  )
}
