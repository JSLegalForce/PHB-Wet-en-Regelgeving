# Bronregister

Peildatum: 2 november 2026.

## 1. Aangeleverde bronnen volgens het opdrachtdocument

Het opdrachtdocument (`CODEX_OPDRACHT_PHB_WET_EN_REGELGEVING.md`) noemt een ZIP met de map `bronnen/`. **Die ZIP was bij deze bouw niet beschikbaar.** Alleen het opdrachtdocument zelf is gebruikt.

| Bestand | Rol volgens opdracht | Status bij deze bouw | Gebruikt voor |
|---|---|---|---|
| `Toetsmatrijs-Wet-en-Regelgeving-Domein-I-1-december-2024-1.2.pdf` | leidend: scope, examentermen, K/B/T, aantallen | **ontbreekt** | — (alleen de in het opdrachtdocument genoemde termreeksen per module en de examenvoorwaarden 50/90/70%) |
| `PHB 1 -  dag 1 - H1 tm 3.pptx` | uitleg lesdag 1 | **ontbreekt** | — |
| `AVO - H4.pptx` | aanvullend hoofdstuk 4 | **ontbreekt** | — |
| `dag 2 phb wet- en regelgeving(1).pptx` | uitleg lesdag 2 | **ontbreekt** | — |
| `Lesdag 3 PPT totaal.pptx` | uitleg lesdag 3 | **ontbreekt** | — |
| `Oefentoets H1.docx` (13 vragen) | conceptvragen | **ontbreekt** | — |
| `Oefentoets H2.docx` (8 vragen) | conceptvragen | **ontbreekt** | — |
| `Oefentoets H3.docx` (12 vragen) | conceptvragen | **ontbreekt** | — |
| `wat wordt er behandeld(1).png` | onderwerpenoverzicht | **ontbreekt** | — |
| `Toetsmatrijs-Boa-Basisbekwaamheid-Rechtskennis-1.9(1).pdf` | alleen ter vergelijking, niet leidend | **ontbreekt** | — |

## 2. Wat in plaats daarvan is gebruikt

- **Opdrachtdocument** §2 en §3: examenvoorwaarden (50 gesloten vragen, 90 minuten, cesuur 70%), de indeling in 11 modules met termreeksen (1.1.1–1.3.2 t/m 5.8.1) en de onderwerpen per module.
- **Wet- en regelgeving** (eigen kennis van de schrijvers, peildatum 2 november 2026), steeds met wet en artikel in `sourceRefs`. Waar artikelnummers of inhoud niet zeker waren, staat `"verify": true` en een `reviewNote`. Voor module 8 (WED) zijn artikelnummers nagekeken op wetten.overheid.nl; de medewerkingsplicht staat in art. 24a WED.
- **Model-APV (VNG)** voor module 4: artikelnummers alleen met `verify: true`, omdat iedere gemeente een eigen APV en nummering heeft.
- Er is **geen rechtspraak** gebruikt of genoemd.

## 3. Interpretatieproblemen en open punten

1. Zonder matrix zijn de **officiële examentermen** (tussenliggende ID's, omschrijving, K/B/T, bronpagina) en de **aantallen per groep** onbekend. `curriculum.json` bevat daarom lege `terms` en `examGroups`; er zijn bewust geen ID's of quota verzonnen.
2. De lesindeling per module volgt de onderwerpen uit het opdrachtdocument. Na het inlezen van de matrix kan het nodig zijn lessen te splitsen of samen te voegen, zodat iedere examenterm een les heeft.
3. Module 6: het opdrachtdocument noemt art. 45 en **45a** Alcoholwet. De inhoud van art. 45a is niet uitgewerkt en staat als reviewpunt open.
4. De 33 bestaande oefenvragen konden niet worden geïmporteerd of gecontroleerd. Alle vragen in de cursus zijn nieuw (`origin: "nieuw"`).

## 4. Zodra de bronnen er zijn

1. Lees de matrix in: `terms`, `examGroups`, `matrix.status = "ingelezen"` in `src/content/curriculum.json`.
2. Koppel lessen en vragen aan termen (`termIds`) en draai `npm run check:content`.
3. Vergelijk iedere les met de PowerPoints en vul aan of corrigeer.
4. Importeer Oefentoets H1–H3 als vragen met `origin: "Oefentoets H1 vraag N"` en `reviewStatus: "concept"`.
5. Werk dit bronregister bij met hoofdstukken, slides en pagina's per bron.
