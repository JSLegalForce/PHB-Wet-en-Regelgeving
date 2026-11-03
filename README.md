# PHB Wet- en Regelgeving Domein I – JS Legal Force

E-learning voor boa's in Domein I ter voorbereiding op het PHB-examen Wet- en Regelgeving: elf modules met korte lessen, oefenvragen met waarom-uitleg, een proefexamen (50 vragen, 90 minuten, cesuur 70%) en een kennisbank. Zelfde JS Legal Force-uitstraling als de andere cursussen.

- Live (na publicatie): https://jslegalforce.github.io/PHB-Wet-en-Regelgeving/
- Launcher (donker startscherm met "Open e-learning op groot scherm", zelfde werking als de Vuurwerk-launcher): https://jslegalforce.github.io/PHB-Wet-en-Regelgeving/launcher/ (bron: `launcher/index.html`, wordt bij `npm run build` naar `docs/launcher/` gekopieerd).

## Status (versie 0.9)

| Onderdeel | Status |
|---|---|
| App: dashboard, leren, oefenen, proefexamen, kennisbank, docentpagina | klaar en getest |
| Leerinhoud alle 11 modules | geschreven, **concept – juridische review nodig** |
| Officiële examentermen en aantallen (toetsmatrijs) | **nog niet ingelezen** – bronnen-ZIP ontbrak |
| 33 bestaande oefenvragen (Oefentoets H1–H3) | **nog niet geïmporteerd** – bronnen-ZIP ontbrak |
| Officieel proefexamen | geblokkeerd tot matrix ingelezen en genoeg vragen goedgekeurd |
| Conceptproefexamen | beschikbaar, duidelijk gelabeld als concept |

Actuele aantallen per module: `documentatie/toetsmatrijs-dekking.md`. Alle open juridische punten: `TODO_JURIDISCHE_REVIEW.md`. Bronnen: `documentatie/bronregister.md`.

## Lokaal starten

Vereist: Node.js 20 of hoger.

```bash
npm install
npm run dev          # ontwikkelserver, open de getoonde link
npm test             # unit- en componenttests (Vitest)
npm run build        # contentcontrole + typecheck + productiebuild in docs/
npm run check:content  # alleen de inhoud valideren en rapporten bijwerken
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

- **Officieel**: alleen goedgekeurde meerkeuzevragen, exact de aantallen per examengroep uit `curriculum.json`, geen herhaling of aanvulling. Ontbreekt iets, dan ziet de cursist waarom het examen nog niet beschikbaar is.
- **Concept**: 50 unieke meerkeuzevragen (concept of goedgekeurd), verdeeld over de modules naar rato van de omvang van de vragenbank. Altijd zichtbaar als concept gelabeld.
- Klok op basis van een vaste eindtijd (loopt door bij herladen), automatisch inleveren bij 0:00, waarschuwing bij onbeantwoorde vragen, markeren en vrij navigeren, uitslag met analyse per module en onderwerp en nakijken met uitleg.

## Privacy en bekende beperkingen

- Voortgang staat alleen in de browser (localStorage). Geen accounts, geen persoonsgegevens, geen centrale registratie. Echte leerlingresultaten vereisen een backend met authenticatie, autorisatie en een AVG-beoordeling; die is bewust niet gebouwd.
- Alle juridische inhoud is nieuw geschreven en nog niet gecontroleerd. Lessen en vragen tonen dat zichtbaar.
- Model-APV-artikelnummers (module 4) kunnen per gemeente afwijken.
- Geen afbeeldingen; beelden kunnen later via de vaste JS Legal Force-beeldworkflow worden toegevoegd.
- De JavaScript-bundel is ca. 750 kB (≈ 200 kB gzip), inclusief alle inhoud.
