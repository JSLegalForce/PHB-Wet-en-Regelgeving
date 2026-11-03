# TODO juridische review

_Automatisch bijgewerkt door `npm run check:content` (peildatum 2026-11-03). Wijzig de inhoud in src/content/modules/*.json; dit bestand wordt dan opnieuw opgebouwd._

## Stand van zaken

- Items totaal (lessen, vragen, begrippen): 547
- Goedgekeurd door jurist: 0 · inhoudelijk gecontroleerd (AI, wacht op aftekening): 444 · juridische review nodig: 36 · concept: 67 · afgekeurd: 0

## Algemeen

- [ ] **Aftekening door een inhoudsdeskundige jurist.** Geen enkel item is `goedgekeurd`: dat is bewust voorbehouden aan een menselijke jurist (`npm run review:approve`, zie documentatie/CONTENT_HANDLEIDING.md). Pas daarna wordt het proefexamen volgens toetsmatrijs (officieel) vrijgegeven.
- [ ] **Ontbrekende bronbestanden.** De PowerPoints lesdag 1/2/3, AVO H4 en Oefentoets H1–H3 (33 vragen) zijn niet aangeleverd bij de herziening van 3-11-2026 en dus niet geïmporteerd of vergeleken. Importeer ze alsnog met `origin` en controleer per vraag de antwoordsleutel.
- [ ] **APV**: module 4 volgt de nummering van de VNG Model-APV; per gemeente kunnen nummering, inhoud en aanwijzingsbesluiten afwijken.
- [ ] **Domeinlijst**: controleer per boa (akte, domeinlijst Domein I, aantekeningen) welke feiten en bevoegdheden daadwerkelijk zijn toegekend.

## Reviewpunten per module

### Module 1 – Organisatie, regelgeving en samenwerking

- [ ] **Les `m01-l01`** — De gemeente als organisatie
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: (1) Gemeentewet art. 34 als bron voor de samenstelling van het college (burgemeester en wethouders). (2) Gemeentewet art. 100 als bron voor de gemeentesecretaris. (3) Rol van Justis bij de behandeling van de akte-aanvraag namens de minister van JenV en de toetsing van betrouwbaarheid en vakbekwaamheid: welke bepalingen van het Besluit buitengewoon opsporingsambtenaar en de Beleidsregels boa precies. (4) Toezicht door het OM op de opsporingstaak van boa's en de verplichtingen van de werkgever: exacte grondslag in Besluit boa / Beleidsregels boa.
  - Te controleren bron: art. 34 Gemeentewet; art. 100 Gemeentewet; Besluit buitengewoon opsporingsambtenaar; Beleidsregels buitengewoon opsporingsambtenaar
- [ ] **Les `m01-l02`** — Regelgeving: van wet tot APV
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: (1) Gemeentewet art. 121 (aanvullende verordeningen) en art. 122 (vervallen van rechtswege bij regeling van hetzelfde onderwerp door hogere regeling): juiste artikelnummers en formulering. (2) Gemeentewet art. 154: strafmaximum hechtenis ten hoogste drie maanden of geldboete tweede categorie (lid 1a) en kwalificatie als overtreding: juiste leden. (3) Vindplaats van de domeinlijst Domein I (Beleidsregels boa, bijlage).
  - Te controleren bron: art. 121 Gemeentewet; art. 122 Gemeentewet; art. 154 Gemeentewet; Beleidsregels buitengewoon opsporingsambtenaar
- [ ] **Les `m01-l03`** — Persoonsgegevens: AVG of Wet politiegegevens?
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: (1) Exacte naam en grondslag in de Wpg van het besluit dat de Wpg-regels van toepassing verklaart op boa's (vermoedelijk 'Besluit politiegegevens buitengewoon opsporingsambtenaren'), en welk Wpg-artikel daarvoor de basis is. (2) Wpg art. 3 (doelbinding/noodzaak) en art. 4 (juistheid) als vindplaats van de beginselen; Wpg-artikel over beveiliging (art. 4a?). (3) Afbakening: geldt voor de boa die een bestuurlijke strafbeschikking of andere afdoening voorbereidt de Wpg of de AVG? Les gaat uit van: opsporingstaak = Wpg, bestuurlijk toezicht = AVG/UAVG. (4) UAVG art. 6 als bron voor de Autoriteit Persoonsgegevens.
  - Te controleren bron: art. 3 en 4 Wet politiegegevens; Besluit politiegegevens buitengewoon opsporingsambtenaren; art. 6 Uitvoeringswet Algemene verordening gegevensbescherming
- [ ] **Les `m01-l04`** — Gebruik en verstrekken van persoonsgegevens
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: (1) Wpg art. 7 als bron voor de geheimhoudingsplicht bij verwerking van politiegegevens. (2) Ambtenarenwet 2017 art. 9 als bron voor de algemene geheimhoudingsplicht van ambtenaren. (3) Sr art. 272: geldt de strafbaarstelling ook voor wie vroeger tot geheimhouding verplicht was (na einde dienstverband)? (4) Wpg-bepaling over melden van een datalek (art. 33a?) en de rechten van betrokkenen onder de Wpg (art. 25 e.v.?) en de beperkingen daarop. (5) Bodycambeelden in de opsporingstaak: vallen ze onder de Wpg-regels; bewaartermijnen staan in beleid/instructie van de werkgever. Aanvulling eindredactie bij (3): naar mijn kennis noemt art. 272 Sr ook het geheim dat iemand uit hoofde van een vroeger ambt moet bewaren; dat zou de zin "ook na je dienst" ondersteunen. Bevestigen.
  - Te controleren bron: art. 272 Wetboek van Strafrecht; art. 7 Wet politiegegevens; art. 9 Ambtenarenwet 2017; Wet politiegegevens
- [ ] **Les `m01-l05`** — Samenwerking met de politie
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: (1) Sv art. 53: welk lid regelt dat een opsporingsambtenaar de aangehoudene voorgeleidt aan de (hulp)officier van justitie en dat een ander dan een opsporingsambtenaar de aangehoudene overlevert aan een opsporingsambtenaar. (2) Of de Beleidsregels boa samenwerkingsafspraken tussen werkgever en politie voorschrijven voor Domein I. (3) Grondslag voor de inzet van geweld door boa's (Besluit boa, toekenning in akte, Ambtsinstructie): les noemt alleen dat dit in de akte moet zijn toegekend.
  - Te controleren bron: art. 53 Wetboek van Strafvordering; Beleidsregels buitengewoon opsporingsambtenaar
- [ ] **Les `m01-l06`** — Ketenpartners
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: (1) Sr art. 77e: leeftijdsgrens Halt-afdoening (12 tot 18 jaar) en welke opsporingsambtenaren (ook boa's) een jongere naar Halt mogen verwijzen; feitenlijst in het Besluit aanwijzing Halt-feiten. (2) Wmo 2015 art. 4.1.1 als grondslag voor Veilig Thuis (advies- en meldpunt huiselijk geweld en kindermishandeling). (3) Juiste wettelijke omschrijving van de rol van het CJIB bij inning van boetes (Wahv, strafbeschikking art. 257a Sv, tenuitvoerlegging). (4) Of de boa onder de Wet verplichte meldcode huiselijk geweld en kindermishandeling valt: les spreekt alleen van 'werkafspraken of meldcode van je organisatie'. (5) Aanvulling eindredactie: in het praktijkvoorbeeld vinden de boa's post in een vuilniszak. Controleren op welke grondslag een boa een afvalzak mag openen of onderzoeken (art. 5:17 Awb als toezichthouder, of een opsporingsbevoegdheid uit de akte) en dat eventueel kort in het voorbeeld noemen.
  - Te controleren bron: art. 77e Wetboek van Strafrecht; Besluit aanwijzing Halt-feiten; art. 4.1.1 Wet maatschappelijke ondersteuning 2015; Centraal Justitieel Incassobureau (CJIB); art. 5:17 Algemene wet bestuursrecht
- [ ] **Vraag `q-m01-l01-1`** — Koppel elk orgaan aan de taak die erbij hoort.
  - Status: concept
- [ ] **Vraag `q-m01-l01-2`** — Wie is in de gemeente belast met de handhaving van de openbare orde?
  - Status: concept
- [ ] **Vraag `q-m01-l01-3`** — Mag Daan dit feit opsporen?
  - Status: concept
- [ ] **Vraag `q-m01-l01-4`** — Onder wiens gezag sta je als boa wanneer je een strafbaar feit opspoort?
  - Status: concept
- [ ] **Vraag `q-m01-l01-5`** — Wat is het verschil tussen de taak van de gemeenteraad en die van het college van B en W?
  - Status: concept
- [ ] **Vraag `q-m01-l01-6`** — Stelling: een handhavingsprioriteit of werkafspraak van je werkgever kan je extra opsporingsbevoegdheden geven.
  - Status: concept
- [ ] **Vraag `q-m01-l01-7`** — Van wie maakt de burgemeester gebruik bij de handhaving van de openbare orde?
  - Status: concept
- [ ] **Vraag `q-m01-l02-1`** — Zet deze regelingen in de juiste rangorde, van hoog naar laag.
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: Gemeentewet art. 122 als bron voor het vervallen van verordeningsbepalingen bij regeling door een hogere regeling. Aanvulling eindredactie: art. 121 en 122 Gemeentewet noemen wet, AMvB en provinciale verordening, maar geen ministeriële regeling. Controleren of de plaatsing "ministeriële regeling boven gemeentelijke verordening" als vaste rangorde verdedigbaar is, of dat de vraag beter zonder ministeriële regeling kan.
  - Te controleren bron: art. 122 Gemeentewet
- [ ] **Vraag `q-m01-l02-2`** — Wie stelt de Algemene plaatselijke verordening (APV) vast?
  - Status: concept
- [ ] **Vraag `q-m01-l02-3`** — Wat voor soort regeling is het Reglement verkeersregels en verkeerstekens 1990 (RVV 1990)?
  - Status: concept
- [ ] **Vraag `q-m01-l02-4`** — Een bepaling in de APV is in strijd met een wet. Welke regel gaat voor?
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: Gemeentewet art. 121 en 122 als bron voor aanvullende verordeningen en het vervallen van rechtswege.
  - Te controleren bron: art. 121 Gemeentewet; art. 122 Gemeentewet
- [ ] **Vraag `q-m01-l02-5`** — Waardoor wordt overtreding van een APV-bepaling een strafbaar feit?
  - Status: concept
- [ ] **Vraag `q-m01-l02-6`** — Kun je de vrouw nu bekeuren op grond van deze nieuwe regel?
  - Status: concept
- [ ] **Vraag `q-m01-l02-7`** — Waar kijk je om te weten of je een strafbaar feit als boa mag opsporen?
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: vindplaats van de domeinlijst Domein I in de Beleidsregels buitengewoon opsporingsambtenaar.
  - Te controleren bron: Beleidsregels buitengewoon opsporingsambtenaar
- [ ] **Vraag `q-m01-l03-1`** — Welk regime is van toepassing op de gegevens die Thijs noteert?
  - Status: concept
- [ ] **Vraag `q-m01-l03-2`** — Wat is een persoonsgegeven volgens de AVG?
  - Status: concept
- [ ] **Vraag `q-m01-l03-3`** — Welke regels gelden voor de gegevens die Esra hierbij noteert?
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: naam en grondslag van het besluit dat de Wpg-regels van toepassing verklaart op boa's in hun opsporingstaak (vermoedelijk 'Besluit politiegegevens buitengewoon opsporingsambtenaren').
  - Te controleren bron: Besluit politiegegevens buitengewoon opsporingsambtenaren
- [ ] **Vraag `q-m01-l03-4`** — Hoe heet het beginsel dat je gegevens alleen gebruikt voor het doel waarvoor je ze hebt verzameld?
  - Status: concept
- [ ] **Vraag `q-m01-l03-5`** — Waarom geldt de AVG niet als je als boa een strafbaar feit opspoort?
  - Status: concept
- [ ] **Vraag `q-m01-l03-6`** — Stelling: een opname van je bodycam waarop een persoon herkenbaar is, bevat persoonsgegevens.
  - Status: concept
- [ ] **Vraag `q-m01-l03-7`** — Wat doe je met deze informatie over haar gezondheid?
  - Status: concept
- [ ] **Vraag `q-m01-l04-1`** — Wat doe je nu je opschrijfboekje met persoonsgegevens kwijt is?
  - Status: concept
- [ ] **Vraag `q-m01-l04-2`** — Binnen welke termijn moet de verwerkingsverantwoordelijke een meldplichtig datalek zo mogelijk melden bij de Autoriteit Persoonsgegevens?
  - Status: concept
- [ ] **Vraag `q-m01-l04-3`** — Wat zeg je tegen de melder?
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: Wpg art. 7 als bron voor de geheimhoudingsplicht bij politiegegevens.
  - Te controleren bron: art. 7 Wet politiegegevens
- [ ] **Vraag `q-m01-l04-4`** — Mag je het adres aan je collega geven?
  - Status: concept
- [ ] **Vraag `q-m01-l04-5`** — Welk recht heeft een betrokkene volgens de AVG?
  - Status: concept
- [ ] **Vraag `q-m01-l04-6`** — Hoe leg je de overtreding op de juiste manier vast?
  - Status: concept
- [ ] **Vraag `q-m01-l05-1`** — Wat doe je met deze waarneming?
  - Status: concept
- [ ] **Vraag `q-m01-l05-2`** — Welk artikel bepaalt dat de officier van justitie bevelen kan geven aan opsporingsambtenaren, ook aan boa's?
  - Status: concept
- [ ] **Vraag `q-m01-l05-3`** — Geeft dit convenant je de bevoegdheid om tassen te doorzoeken?
  - Status: concept
- [ ] **Vraag `q-m01-l05-4`** — Wie is volgens het Wetboek van Strafvordering algemeen opsporingsambtenaar?
  - Status: concept
- [ ] **Vraag `q-m01-l05-5`** — Wat geef je in elk geval door aan de agenten die de verdachte overnemen?
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: welk lid van art. 53 Sv de voorgeleiding aan de (hulp)officier van justitie regelt.
  - Te controleren bron: art. 53 Wetboek van Strafvordering
- [ ] **Vraag `q-m01-l05-6`** — Stelling: als de politie een verdachte van je overneemt, hoef je zelf geen proces-verbaal meer op te maken van wat jij hebt waargenomen.
  - Status: concept
- [ ] **Vraag `q-m01-l05-7`** — Waarom schakel je bij een vechtpartij de politie in?
  - Status: concept
- [ ] **Vraag `q-m01-l06-1`** — Koppel elke situatie aan de ketenpartner die erbij hoort.
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: Sr art. 77e (Halt-afdoening, leeftijd) en Wmo 2015 art. 4.1.1 (Veilig Thuis) als bronnen.
  - Te controleren bron: art. 77e Wetboek van Strafrecht; art. 4.1.1 Wet maatschappelijke ondersteuning 2015
- [ ] **Vraag `q-m01-l06-2`** — Wat is de taak van het CJIB?
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: juiste wettelijke omschrijving van de rol van het CJIB bij verwerking en inning van boetes.
  - Te controleren bron: Centraal Justitieel Incassobureau (CJIB)
- [ ] **Vraag `q-m01-l06-3`** — Welke ketenpartner beslist of een verdachte strafrechtelijk wordt vervolgd?
  - Status: concept
- [ ] **Vraag `q-m01-l06-4`** — Wat doe je met wat de bewoonster je vertelt?
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: Wmo 2015 art. 4.1.1 als grondslag voor Veilig Thuis; en of boa's onder de Wet verplichte meldcode vallen.
  - Te controleren bron: art. 4.1.1 Wet maatschappelijke ondersteuning 2015
- [ ] **Vraag `q-m01-l06-5`** — Mag je de gevraagde gegevens aan de woningcorporatie geven?
  - Status: concept
- [ ] **Vraag `q-m01-l06-6`** — Wanneer treed je als boa zelf op?
  - Status: concept
- [ ] **Vraag `q-m01-l06-7`** — Stelling: een convenant tussen gemeente en woningcorporatie is op zichzelf een voldoende grondslag om persoonsgegevens te delen.
  - Status: concept
- [ ] **Begrip `College van burgemeester en wethouders`** — College van burgemeester en wethouders
  - Status: concept
- [ ] **Begrip `Burgemeester`** — Burgemeester
  - Status: concept
- [ ] **Begrip `Gemeentelijke verordening`** — Gemeentelijke verordening
  - Status: concept
- [ ] **Begrip `Algemene plaatselijke verordening (APV)`** — Algemene plaatselijke verordening (APV)
  - Status: concept
- [ ] **Begrip `Algemene maatregel van bestuur (AMvB)`** — Algemene maatregel van bestuur (AMvB)
  - Status: concept
- [ ] **Begrip `Akte van opsporingsbevoegdheid`** — Akte van opsporingsbevoegdheid
  - Status: concept
- [ ] **Begrip `Domeinlijst`** — Domeinlijst
  - Status: concept
- [ ] **Begrip `Persoonsgegeven`** — Persoonsgegeven
  - Status: concept
- [ ] **Begrip `Politiegegeven`** — Politiegegeven
  - Status: concept
- [ ] **Begrip `Convenant`** — Convenant
  - Status: concept

### Module 2 – Strafrecht en strafvordering

- [ ] **Les `m02-l01`** — Strafbaar feit en verdachte
  - Status: concept
- [ ] **Les `m02-l02`** — Gegevens verzamelen: staande houden en identificeren
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: (1) of de verplichting van de verdachte om op vordering van een opsporingsambtenaar een identiteitsbewijs te tonen in art. 2 WID of in art. 27a Sv is geregeld, en hoe art. 2 WID precies luidt (welke ambtenaren, leeftijd 14 jaar); (2) of art. 435 aanhef en onder 4 Sr de juiste grondslag is voor het opgeven van een valse naam of vals adres.
  - Te controleren bron: art. 1 en art. 2 Wet op de identificatieplicht; art. 435 aanhef en onder 4 Wetboek van Strafrecht
- [ ] **Les `m02-l03`** — Aanhouden
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: verdeling over de leden van art. 53 Sv (in welk lid de voorgeleiding aan de (hulp)officier van justitie staat en in welk lid de overlevering door een burger aan een opsporingsambtenaar) en de exacte formulering 'onverwijld'. Controleren: art. 54 Sv leden 1–3: bevoegdheid OvJ (lid 1), hulpofficier als het bevel van de OvJ niet kan worden afgewacht (lid 2) en opsporingsambtenaar als ook de hulpofficier niet kan worden afgewacht (lid 3?). Daarnaast nagaan of en hoe de akte/het domein van de boa deze bevoegdheid beperkt. Controleren: of art. 7 lid 5 Politiewet 2012 de juiste vindplaats is voor proportionaliteit en subsidiariteit bij geweld, en de toepasselijkheid op boa's via de Ambtsinstructie.
  - Te controleren bron: art. 53 Wetboek van Strafvordering; art. 54 Wetboek van Strafvordering; art. 7 lid 5 Politiewet 2012; art. 53 lid 2 en lid 3 Wetboek van Strafvordering
- [ ] **Les `m02-l04`** — Rechten van de verdachte
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: (1) art. 27c Sv: welke rechten bij aanhouding (lid 1) en vóór het eerste verhoor (lid 2/3) moeten worden meegedeeld, en de schriftelijke verklaring van rechten; (2) art. 28 e.v. Sv: vindplaats van consultatiebijstand (art. 28c Sv) en verhoorbijstand (art. 28d Sv), de regeling van afstand (art. 28a Sv) en de uitzondering voor minderjarigen; (3) of en hoe het recht op consultatie geldt voor de niet-aangehouden verdachte van een licht feit dat ter plaatse wordt afgedaan; (4) art. 27c en art. 29a Sv als grondslag voor het recht op een tolk.
  - Te controleren bron: art. 27c Wetboek van Strafvordering; art. 28c Wetboek van Strafvordering; art. 28d Wetboek van Strafvordering; art. 29a Wetboek van Strafvordering; art. 27c en art. 28 e.v. Wetboek van Strafvordering
- [ ] **Les `m02-l05`** — Fouillering
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: (1) art. 7 lid 3 Politiewet 2012 als grondslag van de veiligheidsfouillering en de voorwaarden (direct dreigend gevaar, feiten of omstandigheden); (2) of en via welke regeling (akte, Beleidsregels boa, Ambtsinstructie) een boa in Domein I de bevoegdheid tot veiligheidsfouillering kan krijgen; (3) de grondslag van de insluitingsfouillering (Ambtsinstructie, artikelnummer) en of boa's die ooit uitvoeren; (4) art. 56 Sv: wie onderzoek aan kleding en aan het lichaam mag bevelen en uitvoeren (lid 1, lid 2) en de eis van zo mogelijk iemand van hetzelfde geslacht.
  - Te controleren bron: art. 7 lid 3 Politiewet 2012; Ambtsinstructie voor de politie, de Koninklijke marechaussee en andere opsporingsambtenaren; art. 56 Wetboek van Strafvordering
- [ ] **Vraag `q-m02-l01-1`** — Koppel elk begrip aan de juiste omschrijving.
  - Status: concept
- [ ] **Vraag `q-m02-l01-2`** — Wat houdt het wettigheidsbeginsel van art. 1 Sr in?
  - Status: concept
- [ ] **Vraag `q-m02-l01-3`** — Wanneer is iemand volgens art. 27 Sv een verdachte?
  - Status: concept
- [ ] **Vraag `q-m02-l01-4`** — Is hier sprake van ontdekking op heterdaad?
  - Status: concept
- [ ] **Vraag `q-m02-l01-5`** — Waarom mag een boa in Domein I niet zomaar elk strafbaar feit opsporen?
  - Status: concept
- [ ] **Vraag `q-m02-l01-6`** — Stelling: in het Wetboek van Strafrecht staan de misdrijven in Boek 2 en de overtredingen in Boek 3.
  - Status: concept
- [ ] **Vraag `q-m02-l02-1`** — Zet de stappen bij het staande houden van een verdachte in de juiste volgorde.
  - Status: concept
- [ ] **Vraag `q-m02-l02-2`** — Met welk doel mag je een verdachte staande houden op grond van art. 52 Sv?
  - Status: concept
- [ ] **Vraag `q-m02-l02-3`** — Welke gegevens mag je vragen bij het vaststellen van de identiteit volgens art. 27a Sv?
  - Status: concept
- [ ] **Vraag `q-m02-l02-4`** — Wat geldt voor Daan nu hij weigert zijn identiteitsbewijs te tonen?
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: (1) of de verplichting van de verdachte om op vordering van een opsporingsambtenaar een identiteitsbewijs te tonen in art. 2 WID of in art. 27a Sv is geregeld, en hoe art. 2 WID precies luidt (welke ambtenaren, leeftijd 14 jaar); (2) of art. 435 aanhef en onder 4 Sr de juiste grondslag is voor het opgeven van een valse naam of vals adres. Eindredactie 2026-11-02: nagaan of de toonplicht tegenover een boa (als opsporingsambtenaar, niet als toezichthouder) via art. 27a lid 1 Sv loopt en of art. 447e Sr daar dan naar verwijst; de explanation noemt nu alleen de WID.
  - Te controleren bron: art. 1 en art. 2 Wet op de identificatieplicht
- [ ] **Vraag `q-m02-l02-5`** — Je hebt een verdachte staande gehouden en zijn identiteit vastgesteld. Je wilt nu weten waarom hij het feit pleegde. Wat geldt?
  - Status: concept
- [ ] **Vraag `q-m02-l02-6`** — Een verdachte geeft je bij het staande houden bewust een valse naam op. Wat geldt voor die valse opgave?
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren of art. 435 aanhef en onder 4 Sr de juiste vindplaats is en of de omschrijving (valse naam, voornaam, vals adres aan een ambtenaar die daarnaar vraagt) klopt.
  - Te controleren bron: art. 435 aanhef en onder 4 Wetboek van Strafrecht
- [ ] **Vraag `q-m02-l03-1`** — Mag je Sander aanhouden?
  - Status: concept
- [ ] **Vraag `q-m02-l03-2`** — Wie mag volgens art. 53 lid 1 Sv een verdachte op heterdaad aanhouden?
  - Status: concept
- [ ] **Vraag `q-m02-l03-3`** — Wat is het verschil tussen aanhouden op heterdaad en buiten heterdaad?
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: art. 54 Sv leden 1–3: bevoegdheid OvJ (lid 1), hulpofficier als het bevel van de OvJ niet kan worden afgewacht (lid 2) en opsporingsambtenaar als ook de hulpofficier niet kan worden afgewacht (lid 3?). Daarnaast nagaan of en hoe de akte/het domein van de boa deze bevoegdheid beperkt.
  - Te controleren bron: art. 54 Wetboek van Strafvordering
- [ ] **Vraag `q-m02-l03-4`** — Je hebt een verdachte op heterdaad aangehouden. Wat moet er dan gebeuren?
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: verdeling over de leden van art. 53 Sv (in welk lid de voorgeleiding aan de (hulp)officier van justitie staat en in welk lid de overlevering door een burger aan een opsporingsambtenaar) en de exacte formulering 'onverwijld'.
  - Te controleren bron: art. 53 lid 2 en lid 3 Wetboek van Strafvordering
- [ ] **Vraag `q-m02-l03-5`** — Stelling: als je bevoegd bent om aan te houden, ben je ook verplicht om altijd aan te houden.
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: of art. 7 lid 5 Politiewet 2012 de juiste vindplaats is voor proportionaliteit en subsidiariteit bij geweld, en de toepasselijkheid op boa's via de Ambtsinstructie.
  - Te controleren bron: art. 7 lid 5 Politiewet 2012
- [ ] **Vraag `q-m02-l03-6`** — Welk optreden past het best bij dit feit?
  - Status: concept
- [ ] **Vraag `q-m02-l04-1`** — Je hebt een verdachte staande gehouden en wilt hem ter plaatse vragen stellen over het feit. Zet de stappen in de juiste volgorde.
  - Status: concept
- [ ] **Vraag `q-m02-l04-2`** — Wat is de cautie?
  - Status: concept
- [ ] **Vraag `q-m02-l04-3`** — Wanneer is er sprake van een verhoor waarvoor je de cautie moet geven?
  - Status: concept
- [ ] **Vraag `q-m02-l04-4`** — Wat had je moeten doen voordat je deze vraag stelde?
  - Status: concept
- [ ] **Vraag `q-m02-l04-5`** — Welk recht heeft een aangehouden verdachte voordat de politie hem voor het eerst verhoort?
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: (1) art. 27c Sv: welke rechten bij aanhouding (lid 1) en vóór het eerste verhoor (lid 2/3) moeten worden meegedeeld, en de schriftelijke verklaring van rechten; (2) art. 28 e.v. Sv: vindplaats van consultatiebijstand (art. 28c Sv) en verhoorbijstand (art. 28d Sv), de regeling van afstand (art. 28a Sv) en de uitzondering voor minderjarigen; (3) of en hoe het recht op consultatie geldt voor de niet-aangehouden verdachte van een licht feit dat ter plaatse wordt afgedaan; (4) art. 27c en art. 29a Sv als grondslag voor het recht op een tolk.
  - Te controleren bron: art. 28c Wetboek van Strafvordering; art. 28d Wetboek van Strafvordering; art. 27c Wetboek van Strafvordering
- [ ] **Vraag `q-m02-l04-6`** — Wat geldt als je een verdachte wilt verhoren die de Nederlandse taal niet of onvoldoende begrijpt?
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: (1) art. 27c Sv: welke rechten bij aanhouding (lid 1) en vóór het eerste verhoor (lid 2/3) moeten worden meegedeeld, en de schriftelijke verklaring van rechten; (2) art. 28 e.v. Sv: vindplaats van consultatiebijstand (art. 28c Sv) en verhoorbijstand (art. 28d Sv), de regeling van afstand (art. 28a Sv) en de uitzondering voor minderjarigen; (3) of en hoe het recht op consultatie geldt voor de niet-aangehouden verdachte van een licht feit dat ter plaatse wordt afgedaan; (4) art. 27c en art. 29a Sv als grondslag voor het recht op een tolk.
  - Te controleren bron: art. 27c Wetboek van Strafvordering; art. 29a Wetboek van Strafvordering
- [ ] **Vraag `q-m02-l05-1`** — Koppel elke vorm van fouillering of onderzoek aan het juiste doel.
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: (1) art. 7 lid 3 Politiewet 2012 als grondslag van de veiligheidsfouillering en de voorwaarden (direct dreigend gevaar, feiten of omstandigheden); (2) of en via welke regeling (akte, Beleidsregels boa, Ambtsinstructie) een boa in Domein I de bevoegdheid tot veiligheidsfouillering kan krijgen; (3) de grondslag van de insluitingsfouillering (Ambtsinstructie, artikelnummer) en of boa's die ooit uitvoeren; (4) art. 56 Sv: wie onderzoek aan kleding en aan het lichaam mag bevelen en uitvoeren (lid 1, lid 2) en de eis van zo mogelijk iemand van hetzelfde geslacht.
  - Te controleren bron: art. 7 lid 3 Politiewet 2012; Ambtsinstructie voor de politie, de Koninklijke marechaussee en andere opsporingsambtenaren; art. 56 Wetboek van Strafvordering
- [ ] **Vraag `q-m02-l05-2`** — Wat is het doel van een veiligheidsfouillering?
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: (1) art. 7 lid 3 Politiewet 2012 als grondslag van de veiligheidsfouillering en de voorwaarden (direct dreigend gevaar, feiten of omstandigheden); (2) of en via welke regeling (akte, Beleidsregels boa, Ambtsinstructie) een boa in Domein I de bevoegdheid tot veiligheidsfouillering kan krijgen; (3) de grondslag van de insluitingsfouillering (Ambtsinstructie, artikelnummer) en of boa's die ooit uitvoeren; (4) art. 56 Sv: wie onderzoek aan kleding en aan het lichaam mag bevelen en uitvoeren (lid 1, lid 2) en de eis van zo mogelijk iemand van hetzelfde geslacht.
  - Te controleren bron: art. 7 lid 3 Politiewet 2012
- [ ] **Vraag `q-m02-l05-3`** — Mag een boa in Domein I altijd een veiligheidsfouillering uitvoeren?
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: (1) art. 7 lid 3 Politiewet 2012 als grondslag van de veiligheidsfouillering en de voorwaarden (direct dreigend gevaar, feiten of omstandigheden); (2) of en via welke regeling (akte, Beleidsregels boa, Ambtsinstructie) een boa in Domein I de bevoegdheid tot veiligheidsfouillering kan krijgen; (3) de grondslag van de insluitingsfouillering (Ambtsinstructie, artikelnummer) en of boa's die ooit uitvoeren; (4) art. 56 Sv: wie onderzoek aan kleding en aan het lichaam mag bevelen en uitvoeren (lid 1, lid 2) en de eis van zo mogelijk iemand van hetzelfde geslacht.
  - Te controleren bron: art. 7 lid 3 Politiewet 2012
- [ ] **Vraag `q-m02-l05-4`** — Wat is de juiste handelwijze?
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: (1) art. 7 lid 3 Politiewet 2012 als grondslag van de veiligheidsfouillering en de voorwaarden (direct dreigend gevaar, feiten of omstandigheden); (2) of en via welke regeling (akte, Beleidsregels boa, Ambtsinstructie) een boa in Domein I de bevoegdheid tot veiligheidsfouillering kan krijgen; (3) de grondslag van de insluitingsfouillering (Ambtsinstructie, artikelnummer) en of boa's die ooit uitvoeren; (4) art. 56 Sv: wie onderzoek aan kleding en aan het lichaam mag bevelen en uitvoeren (lid 1, lid 2) en de eis van zo mogelijk iemand van hetzelfde geslacht.
  - Te controleren bron: art. 7 lid 3 Politiewet 2012
- [ ] **Vraag `q-m02-l05-5`** — Waarvoor dient onderzoek aan kleding en lichaam van een aangehouden verdachte op grond van art. 56 Sv?
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: (1) art. 7 lid 3 Politiewet 2012 als grondslag van de veiligheidsfouillering en de voorwaarden (direct dreigend gevaar, feiten of omstandigheden); (2) of en via welke regeling (akte, Beleidsregels boa, Ambtsinstructie) een boa in Domein I de bevoegdheid tot veiligheidsfouillering kan krijgen; (3) de grondslag van de insluitingsfouillering (Ambtsinstructie, artikelnummer) en of boa's die ooit uitvoeren; (4) art. 56 Sv: wie onderzoek aan kleding en aan het lichaam mag bevelen en uitvoeren (lid 1, lid 2) en de eis van zo mogelijk iemand van hetzelfde geslacht.
  - Te controleren bron: art. 56 Wetboek van Strafvordering
- [ ] **Vraag `q-m02-l05-6`** — Stelling: een fouillering of onderzoek aan het lichaam gebeurt zo mogelijk door iemand van hetzelfde geslacht als de persoon.
  - Status: juridische_review_nodig
  - Reviewpunt: Controleren: (1) art. 7 lid 3 Politiewet 2012 als grondslag van de veiligheidsfouillering en de voorwaarden (direct dreigend gevaar, feiten of omstandigheden); (2) of en via welke regeling (akte, Beleidsregels boa, Ambtsinstructie) een boa in Domein I de bevoegdheid tot veiligheidsfouillering kan krijgen; (3) de grondslag van de insluitingsfouillering (Ambtsinstructie, artikelnummer) en of boa's die ooit uitvoeren; (4) art. 56 Sv: wie onderzoek aan kleding en aan het lichaam mag bevelen en uitvoeren (lid 1, lid 2) en de eis van zo mogelijk iemand van hetzelfde geslacht.
  - Te controleren bron: art. 56 Wetboek van Strafvordering; Ambtsinstructie voor de politie, de Koninklijke marechaussee en andere opsporingsambtenaren
- [ ] **Begrip `Verdachte`** — Verdachte
  - Status: concept
- [ ] **Begrip `Ontdekking op heterdaad`** — Ontdekking op heterdaad
  - Status: concept
- [ ] **Begrip `Wettigheidsbeginsel`** — Wettigheidsbeginsel
  - Status: concept
- [ ] **Begrip `Staande houden`** — Staande houden
  - Status: concept
- [ ] **Begrip `Aanhouden`** — Aanhouden
  - Status: concept
- [ ] **Begrip `Cautie`** — Cautie
  - Status: concept
- [ ] **Begrip `Veiligheidsfouillering`** — Veiligheidsfouillering
  - Status: concept
  - Te controleren bron: art. 7 lid 3 Politiewet 2012

### Module 3 – Algemene wet bestuursrecht

Geen open reviewpunten; alle items zijn inhoudelijk gecontroleerd (aftekening door jurist volgt).


### Module 4 – Algemene plaatselijke verordening

- [ ] **Les `m04-l04`** (term 4.1.5, 4.1.8) — Collecteren, venten, straatartiesten, standplaatsen en snuffelmarkten
  - Status: juridische_review_nodig
  - Reviewpunt: Art. 5:20 Model-APV: de matrix (PHB v1.3) noemt art. 5:20, maar de Toelichting Model-APV zomer 2024 heeft geen artikelkop bij 5:20 (wel 5:19 en 5:21 vervallen). De les volgt de gemeentelijke APV Hendrik-Ido-Ambacht 2026 (art. 5:20 = afbakeningsbepaling). Controleer de normtekst van art. 5:20 in de actuele Model-APV. Controleer ook of art. 5:15 Model-APV (ventverbod in aangewezen gebieden/tijden, zonder vergunningplicht) zo in de modeltekst staat; de les baseert dit op de toelichting.
  - Te controleren bron: art. 5:20 Model-APV (VNG)
- [ ] **Les `m04-l06`** (term 4.1.7) — Parkeeroverlast
  - Status: juridische_review_nodig
  - Reviewpunt: De Toelichting Model-APV zomer 2024 geeft bij art. 5:3, 5:6 lid 1 onder a en 5:8 geen volledige normtekst. De les beschrijft deze artikelen voorzichtig op basis van de toelichting en gemeentelijke APV's (Hendrik-Ido-Ambacht, Ede, Bloemendaal 2026): (1) of art. 5:3 Model-APV alleen geldt op door het college aangewezen wegen; (2) of art. 5:6 lid 1 onder a Model-APV een termijn voor de hele bebouwde kom of alleen voor aangewezen wegen bevat; (3) maten en tijdsuitzondering in art. 5:8. De casusvragen geven daarom de lokale tekst zelf mee.

### Module 5 – Wegenverkeerswet 1994 en RVV 1990

Geen open reviewpunten; alle items zijn inhoudelijk gecontroleerd (aftekening door jurist volgt).


### Module 6 – Alcoholwet

Geen open reviewpunten; alle items zijn inhoudelijk gecontroleerd (aftekening door jurist volgt).


### Module 7 – Winkeltijdenwet

Geen open reviewpunten; alle items zijn inhoudelijk gecontroleerd (aftekening door jurist volgt).


### Module 8 – Wet op de economische delicten

- [ ] **Vraag `q-m08-l02-6`** (term 5.5.2) — Je vordert inzage op grond van de WED. Zet je stappen in een logische volgorde.
  - Status: juridische_review_nodig
  - Reviewpunt: Stap 2 ("op verzoek je legitimatiebewijs tonen"): de algemene legitimatieplicht van de boa (buiten het binnentreden van een woning, art. 1 Awbi) staat in het Besluit buitengewoon opsporingsambtenaar of de bijbehorende regeling; dat artikel kon niet tegen de officiele tekst worden gecontroleerd en is daarom niet als bron opgenomen. Graag artikel bevestigen en als sourceRef toevoegen.

### Module 9 – Omgevingswet

Geen open reviewpunten; alle items zijn inhoudelijk gecontroleerd (aftekening door jurist volgt).


### Module 10 – Visserijwet 1963

Geen open reviewpunten; alle items zijn inhoudelijk gecontroleerd (aftekening door jurist volgt).


### Module 11 – Wet milieubeheer

- [ ] **Vraag `q-m11-l02-5`** (term 5.8.1) — Overtreedt de bakker de afvalstoffenverordening?
  - Status: juridische_review_nodig
  - Reviewpunt: Lokale variatie: controleer in de afvalstoffenverordening van de eigen gemeente of en hoe bedrijfsafval door de inzameldienst wordt ingezameld (VNG-model 2015 art. 11-12, strafbepaling art. 20). Controleer ook of de gemeentelijke inzameldienst voor deze bedrijfsafvalstoffen een bevoegde inzamelaar is in de zin van art. 10.37 lid 2 onder a jo. art. 10.45 Wm (vermelding lijst van inzamelaars of vrijstelling, Besluit inzamelen afvalstoffen), zodat ook art. 10.37 lid 1 niet is overtreden.
