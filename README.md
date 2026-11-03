# PHB Wet- en Regelgeving Domein I – JS Legal Force

E-learning voor boa's in Domein I ter voorbereiding op het PHB-examen Wet- en Regelgeving: elf modules met korte lessen, oefenvragen met waarom-uitleg, een proefexamen (50 vragen, 90 minuten, cesuur 70%) en een kennisbank. Zelfde JS Legal Force-uitstraling als de andere cursussen.

- Live (na publicatie): https://jslegalforce.github.io/PHB-Wet-en-Regelgeving/
- Launcher (donker startscherm met "Open e-learning op groot scherm", zelfde werking als de Vuurwerk-launcher): https://jslegalforce.github.io/PHB-Wet-en-Regelgeving/launcher/ (bron: `launcher/index.html`, wordt bij `npm run build` naar `docs/launcher/` gekopieerd).

## Status (versie 1.0 — juridische herziening 3 november 2026)

| Onderdeel | Status |
|---|---|
| Toetsmatrijs | **ExTH Wet- en Regelgeving Domein I v1.3 (04.03.2025)** volledig ingelezen: 49 toetstermen, 39 quotagroepen, som 50 |
| Leerinhoud | 11 modules, alle lessen en vragen gekoppeld aan toetstermen en regel voor regel gecontroleerd tegen de wettekst geldig op 3-11-2026 |
| Juridische status | `inhoudelijk_gecontroleerd` (AI-controle) of `juridische_review_nodig` met concreet reviewpunt; **aftekening door een jurist volgt** (`npm run review:approve`) |
| Verplichte strafbare feiten/bevoegdheden | alle onderdelen uit de matrix gedekt en getest (o.a. art. 184, 185, 266/267/269, 285 en 231 lid 2 Sr; art. 45 en 45a Alcoholwet) |
| Proefexamen volgens toetsmatrijs | exact de quota per toetsterm, alleen jurist-goedgekeurde vragen; **geblokkeerd tot aftekening** |
| Conceptproefexamen | zelfde quota en vorm, met inhoudelijk gecontroleerde vragen; beschikbaar |
| PowerPoints en Oefentoets H1–H3 | **niet aangeleverd** – niet verwerkt |

Actuele aantallen per module: `documentatie/toetsmatrijs-dekking.md`. Alle open juridische punten: `TODO_JURIDISCHE_REVIEW.md`. Bronnen: `documentatie/bronregister.md`.

## Lokaal starten

Vereist: Node.js 20 of hoger.

```bash
npm install
npm run dev          # ontwikkelserver, open de getoonde link
npm test             # unit- en componenttests (Vitest)
npm run build        # contentcontrole + typecheck + productiebuild in docs/
npm run check:content  # alleen de inhoud valideren en rapporten bijwerken
npm run review:approve -- --door "<naam jurist>" --module m06   # juridische aftekening
npm run test:e2e     # end-to-end (Playwright), na npm run build; eenmalig: npx playwright install chromium
```

## Publiceren op GitHub Pages

De gebouwde site staat in de map `docs/` (die zit gewoon in de repository).

1. Zet de inhoud van deze map in de repository `JSLegalForce/PHB-Wet-en-Regelgeving` (branch `main`).
2. Ga naar **Settings → Pages**. Kies bij *Source* **Deploy from a branch**, branch **main**, map **/docs**, en klik **Save**.
3. Na ongeveer een minuut staat de cursus op https://jslegalforce.github.io/PHB-Wet-en-Regelgeving/.

Na een wijziging in de inhoud: `npm run build` en de bijgewerkte map `docs/` mee committen. De workflow in `.github/workflows/controle.yml` draait bij elke push de tests en de contentcontrole.

Andere reponaam? Bouw dan met `VITE_BASE=/AndereNaam/ npm run build`.

## Structuur

```
src/
  content/            ← ALLE leerinhoud (JSON), los van de code
    curriculum.json   modules, examenvoorwaarden, examentermen en -aantallen
    modules/*.json    lessen, vragen en begrippen per module
    schema.ts         Zod-schema's waar alle inhoud aan moet voldoen
  lib/                examenlogica, voortgang (localStorage), contentcontrole
  components/         vraagkaart (meerkeuze, juist/onjuist, koppelen, volgorde), layout, UI
  pages/              Dashboard, Leren, Les, Oefenen, Proefexamen, Kennisbank, Docent, Over
scripts/check-content.ts   validatie + documentatie/toetsmatrijs-dekking.md + TODO_JURIDISCHE_REVIEW.md
e2e/                  Playwright-tests van de kritieke flows
launcher/             startscherm voor de leeromgeving
documentatie/         handleiding inhoud, bronregister, dekkingsrapport
docs/                 gebouwde site voor GitHub Pages (niet met de hand wijzigen)
```

Inhoud aanpassen zonder code: zie **documentatie/CONTENT_HANDLEIDING.md**. De build stopt bij ongeldige inhoud.

## Proefexamen: regels in de code

- **Proefexamen volgens toetsmatrijs** (`officieel`): exact de aantallen per examengroep uit de ExTH-matrix, alleen door een jurist goedgekeurde meerkeuzevragen op het niveau van de toetsterm, verdeeld over de termen en onderwerpen binnen een groep; geen herhaling of aanvulling. Ontbreekt iets, dan ziet de cursist per groep wat er ontbreekt.
- **Conceptproefexamen**: dezelfde verdeling met inhoudelijk gecontroleerde vragen; alleen bij een tekort aangevuld met reviewvragen, met melding. Beide zijn uitdrukkelijk geen ExTH-examen.
- Klok op basis van een vaste eindtijd (loopt door bij herladen), automatisch inleveren bij 0:00, waarschuwing bij onbeantwoorde vragen, markeren en vrij navigeren, uitslag met analyse per module en onderwerp en nakijken met uitleg.

## Privacy en bekende beperkingen

- Voortgang staat alleen in de browser (localStorage). Geen accounts, geen persoonsgegevens, geen centrale registratie. Echte leerlingresultaten vereisen een backend met authenticatie, autorisatie en een AVG-beoordeling; die is bewust niet gebouwd.
- Alle juridische inhoud is tegen de geldende wettekst gecontroleerd, maar nog niet door een jurist afgetekend. Lessen en vragen tonen hun status zichtbaar. Open punten: `TODO_JURIDISCHE_REVIEW.md`; alle wijzigingen: `documentatie/juridische_wijzigingen.csv`.
- Model-APV-artikelnummers (module 4) volgen de VNG Model-APV (toelichting zomer 2024) en kunnen per gemeente afwijken; de VNG werkt aan een herziene Model-APV.
- Module 5 bevat eigen SVG-tekeningen van verkeerssituaties (`public/afbeeldingen/rvv/`).
- De JavaScript-bundel is ca. 750 kB (≈ 200 kB gzip), inclusief alle inhoud.
