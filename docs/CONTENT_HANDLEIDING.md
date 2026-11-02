# Handleiding inhoud beheren (voor docenten en redactie)

Alle leerinhoud staat in JSON-bestanden. Je hoeft geen code te wijzigen om lessen, vragen of kennisbank-begrippen aan te passen.

```
src/content/
  curriculum.json        modules, examenvoorwaarden, officiële examentermen en aantallen
  modules/m01.json       inhoud module 1 (lessen, vragen, begrippen)
  modules/m02a.json      een module mag over meerdere bestanden verdeeld zijn
  ...
  schema.ts              het schema waar alle bestanden aan moeten voldoen
```

Na elke wijziging: `npm run check:content`. Dit controleert schema, verwijzingen en dubbele ID's en schrijft `docs/toetsmatrijs-dekking.md`. Bij fouten start de build niet (`npm run build` draait de controle eerst).

## Reviewstatus

Iedere les, vraag en elk begrip heeft een `reviewStatus`:

| Status | Betekenis | Wat ziet de cursist? |
|---|---|---|
| `wacht_op_bron` | geen betrouwbare bron, nog geen inhoud | melding "Inhoud in juridische review", geen uitleg |
| `concept` | geschreven, nog niet gecontroleerd | inhoud + zichtbare conceptbanner |
| `juridische_review_nodig` | er is een specifiek punt te controleren (zie `reviewNote`) | inhoud + zichtbare reviewbanner |
| `goedgekeurd` | juridisch gecontroleerd | inhoud zonder banner; vraag telt mee voor het officiële proefexamen |
| `afgekeurd` | niet gebruiken | niet zichtbaar |

Een vraag goedkeuren: zet `reviewStatus` op `goedgekeurd`, verhoog `version` (bv. 1.0 → 1.1), zet `lastModified` op de datum van vandaag en haal eventuele `"verify": true` uit de bronverwijzingen weg. De contentcontrole weigert een goedgekeurde vraag of les met `verify: true`.

## Vaste regels voor inhoud

1. B1-taal waar dat kan, zonder juridisch verlies. Korte zinnen. Spreek de boa aan met "je".
2. Iedere juridische bewering heeft een bron: wet + artikel in `sourceRefs`. Bij wet- en regelgeving alleen wet en artikel noemen; geen datum tenzij die juridisch relevant is.
3. Geen verzonnen uitspraken van rechters, geen ECLI-nummers uit het hoofd.
4. Twijfel over een artikelnummer of inhoud? Zet `"verify": true` bij die bron en beschrijf het punt in `reviewNote`.
5. Geen letterlijke wetsteksten tenzij gecontroleerd: het scherm `law` geeft de inhoud **in eigen woorden**.
6. Casussen zijn fictief, respectvol en controleerbaar. Gebruik neutrale, gevarieerde namen.
7. Strikt scheiden: wettelijke bevoegdheid / taak en beleid / veiligheid / rol van de politie. Beleid is nooit een bevoegdheidsgrondslag.
8. Iedere vraag heeft één eenduidig juist antwoord en bij elke keuze een korte waarom-uitleg.
9. Oefenvragen zijn eigen oefenmateriaal, geen officiële examenvragen.
10. Geen placeholdertekst (lorem, TODO) in lessen.

## Opbouw van een les

Een les bestaat uit schermen (`screens`). Gebruikelijke volgorde:

1. `objectives` – leerdoelen (komen uit `objectives`, met niveau K/B/T)
2. 2–5 × `text`, `law` of `keypoints` – theorie, steeds weinig tekst per scherm (ca. 60–140 woorden)
3. `example` – praktijkvoorbeeld uit het werk van een boa in Domein I
4. `exercise` – één actieve oefening (bijvoorbeeld een casus, koppelen of volgorde)
5. `check` – kennischeck met 3–5 vragen
6. `summary` – samenvatting (komt uit `summary`)

Teksten (`body`): alinea's scheiden met een lege regel (`\n\n`). `**vet**` mag. Een regel die begint met `- ` wordt een opsommingsteken.

## Vraagtypen

- `mc` – meerkeuze (2–4 opties `a`–`d`). Alleen dit type telt mee in het proefexamen (gesloten vragen).
- `truefalse` – stelling juist/onjuist.
- `match` – koppelen (3–6 paren, in de JUISTE combinatie invoeren; de app schudt).
- `order` – volgorde (items in de JUISTE volgorde invoeren; de app schudt).

Een casusvraag is een `mc`-vraag met een `case`-tekst.

## Voorbeeld

```json
{
  "id": "q-m02-l02-1",
  "moduleId": "m02",
  "lessonId": "m02-l02",
  "termIds": [],
  "topic": "Staande houden",
  "level": "T",
  "type": "mc",
  "case": "Je ziet een man op straat een blikje leeg in de berm gooien.",
  "prompt": "Wat is je eerste stap om zijn identiteit vast te stellen?",
  "options": [
    { "id": "a", "text": "Hem staande houden en naar zijn identiteit vragen", "feedback": "Juist. ..." },
    { "id": "b", "text": "Hem aanhouden", "feedback": "Onjuist. ..." },
    { "id": "c", "text": "De politie bellen en wachten", "feedback": "Onjuist. ..." }
  ],
  "correctAnswer": "a",
  "explanation": "Bij een verdachte mag je ...",
  "sourceRefs": [{ "law": "Wetboek van Strafvordering", "article": "art. 52" }],
  "origin": "nieuw",
  "reviewStatus": "concept",
  "version": "1.0",
  "lastModified": "2026-11-02"
}
```

## Officiële examentermen toevoegen

Zodra de PHB-toetsmatrijs is ingelezen:

1. Zet in `curriculum.json` alle termen in `terms` (id, moduleId, omschrijving, niveau, bronpagina).
2. Zet de officiële aantallen in `examGroups`. Groepeer termen zoals de matrix dat doet; verzin geen aantallen per subterm.
3. Zet `matrix.status` op `ingelezen`.
4. Koppel lessen en vragen via `termIds`.
5. Draai `npm run check:content`: het rapport toont welke termen nog geen les of vragen hebben.

Het officiële proefexamen gaat pas open als er per examengroep genoeg **goedgekeurde** meerkeuzevragen zijn.
