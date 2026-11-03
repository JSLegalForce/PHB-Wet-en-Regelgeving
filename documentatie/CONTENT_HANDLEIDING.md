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

Na elke wijziging: `npm run check:content`. Dit controleert schema, verwijzingen en dubbele ID's en schrijft `documentatie/toetsmatrijs-dekking.md`. Bij fouten start de build niet (`npm run build` draait de controle eerst).

## Reviewstatus

Iedere les, vraag en elk begrip heeft een `reviewStatus`:

| Status | Betekenis | Wat ziet de cursist? | Examen |
|---|---|---|---|
| `wacht_op_bron` | geen betrouwbare bron, nog geen inhoud | melding, geen uitleg | nee |
| `concept` | geschreven, nog niet gecontroleerd | inhoud + conceptbanner | nee |
| `juridische_review_nodig` | er staat een concreet juridisch punt open (`reviewNote` verplicht) | inhoud + reviewbanner met reviewpunt | alleen als aanvulling in het conceptproefexamen, met melding |
| `inhoudelijk_gecontroleerd` | regel voor regel gecontroleerd tegen de geldende wettekst (peildatum), wacht op aftekening door een jurist | inhoud + banner ‘gecontroleerd tegen wettekst’ | conceptproefexamen |
| `goedgekeurd` | afgetekend door een menselijke jurist (`reviewedBy`, `reviewedOn` verplicht) | inhoud zonder banner | proefexamen volgens toetsmatrijs én conceptproefexamen |
| `afgekeurd` | niet gebruiken | niet zichtbaar | nee |

### Aftekenen door een jurist

Alleen een mens mag `goedgekeurd` zetten. Gebruik het script, dan wordt ook het wijzigingslog bijgewerkt:

```bash
npm run review:approve -- --door "mr. A. Jansen" --ids q-m06-l01-2,q-m06-l01-3
npm run review:approve -- --door "mr. A. Jansen" --module m06
npm run check:content && npm run build
```

Het script tekent alleen items af met status `inhoudelijk_gecontroleerd` en zonder bron met `verify: true`. Items met een open reviewpunt worden overgeslagen: los eerst het reviewpunt op (tekst aanpassen of bevestigen), zet de status op `inhoudelijk_gecontroleerd` en teken dan af. De contentcontrole weigert `goedgekeurd` zonder `reviewedBy`/`reviewedOn` en weigert ‘Claude’/‘AI’ als aftekenaar.

### Wijzigingslog

Iedere inhoudelijke wijziging komt in `documentatie/juridische_wijzigingen.csv` met de kolommen `bestand, itemId, oud, nieuw, reden, PHB-term, bronURL, geldigOp, reviewStatus`.

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

- `mc` – meerkeuze (2–4 opties `a`–`d`). Alleen dit type telt mee in het proefexamen (gesloten vragen), en alleen als `level` past bij de taxonomie van de gekoppelde toetsterm (bv. term 2.2.4 is T → alleen T-vragen).
- `truefalse` – stelling juist/onjuist.
- `match` – koppelen (3–6 paren, in de JUISTE combinatie invoeren; de app schudt).
- `order` – volgorde (items in de JUISTE volgorde invoeren; de app schudt).

Een casusvraag is een `mc`-vraag met een `case`-tekst.

### Afbeeldingen bij vragen

Voor termen als 5.2.1 (‘aan de hand van een foto’) kan een vraag een `figure` hebben:

```json
"figure": { "src": "afbeeldingen/rvv/gele-streep-onderbroken.svg", "alt": "Bovenaanzicht: ... (alle informatie die nodig is om de vraag zonder afbeelding te beantwoorden)", "caption": "Situatie 1", "credit": "Eigen tekening JS Legal Force" }
```

Het bestand staat in `public/afbeeldingen/…`. Gebruik alleen eigen of rechtenvrije afbeeldingen en vermeld de herkomst in `credit`. De `alt`-tekst is verplicht volledig (toegankelijkheid).

## Voorbeeld

```json
{
  "id": "q-m02-l02-1",
  "moduleId": "m02",
  "lessonId": "m02-l02",
  "termIds": ["2.1.3"],
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

## Toetsmatrijs en examen

`curriculum.json` bevat de ExTH-toetsmatrijs Wet- en Regelgeving Domein I **v1.3 (04.03.2025)**:

- `terms`: alle 49 toetstermen met letterlijke toetsterm, begrip, taxonomie (`taxonomy`, `levels`), wetsverwijzingen (`articles`), opsommingspunten (`elements`), bronpagina en `groupId`.
- `examGroups`: 39 groepen met het aantal examenvragen uit de kolom ‘# vragen’. Samengevoegde cellen in de matrix zijn één groep (bv. 2.5.1–2.5.4 samen 2 vragen; 4.1.8 + 4.1.9 samen 1). De som is precies 50.
- `mandatoryItems`: strafbare feiten en bevoegdheden die nooit stil mogen verdwijnen (o.a. art. 184, 185, 266/267/269, 285 en 231 lid 2 Sr, art. 45 en 45a Alcoholwet). De tests falen als een onderdeel geen les of te weinig vragen heeft.

Bij een nieuwe matrixversie: pas `terms`, `examGroups` en `matrix` aan, draai `npm run check:content` en los alle meldingen op.

Proefexamens (`src/lib/exam.ts`):

- **Proefexamen volgens toetsmatrijs**: exact de quota per groep, uitsluitend `goedgekeurd`, passend niveau, geen herhaling of aanvulling. Bij een tekort is het geblokkeerd en toont het per groep wat ontbreekt.
- **Conceptproefexamen**: dezelfde verdeling met `inhoudelijk_gecontroleerd` of `goedgekeurd`; alleen bij een tekort in een groep aangevuld met `juridische_review_nodig`, met melding.
- Beide zijn eigen oefenmateriaal, geen ExTH-examen.
