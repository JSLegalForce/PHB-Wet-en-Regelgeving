import { z } from 'zod'

/**
 * Inhoudsschema's voor de PHB-e-learning.
 * Alle leerinhoud staat in JSON-bestanden in src/content/. Deze schema's
 * worden gebruikt door de app (bij het laden) én door `npm run check:content`.
 */

export const reviewStatus = z.enum([
  'wacht_op_bron', // er is (nog) geen betrouwbare bron; geen inhoud tonen
  'concept', // nieuw geschreven, nog niet gecontroleerd
  'juridische_review_nodig', // inhoud aanwezig, er is een specifiek juridisch punt te controleren
  'goedgekeurd', // juridisch gecontroleerd en vrijgegeven
  'afgekeurd', // niet gebruiken
])
export type ReviewStatus = z.infer<typeof reviewStatus>

export const level = z.enum(['K', 'B', 'T'])
export type Level = z.infer<typeof level>

export const sourceRef = z.object({
  /** Naam van de regeling, bv. "Wetboek van Strafvordering" of "Model-APV (VNG)" */
  law: z.string().min(2),
  /** Artikel, bv. "art. 52" of "art. 5:12 lid 1" */
  article: z.string().optional(),
  /** Korte toelichting of vindplaats (slide, pagina) */
  note: z.string().optional(),
  /** true = artikelnummer/inhoud moet nog extra worden gecontroleerd */
  verify: z.boolean().optional(),
})
export type SourceRef = z.infer<typeof sourceRef>

const meta = {
  reviewStatus: reviewStatus,
  /** Toelichting voor de jurist: wat precies moet worden gecontroleerd */
  reviewNote: z.string().optional(),
  version: z.string().regex(/^\d+\.\d+$/),
  lastModified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}

// ---------- Vragen ----------

const questionBase = z.object({
  id: z.string().regex(/^q-m\d{2}-[a-z0-9-]+$/),
  moduleId: z.string().regex(/^m\d{2}$/),
  lessonId: z.string().optional(),
  /** Officiële examentermen (bv. "2.3.1"). Leeg zolang de toetsmatrijs niet is ingelezen. */
  termIds: z.array(z.string()).default([]),
  /** Onderwerp binnen de module (vrije tekst, voor analyse en filter) */
  topic: z.string().min(2),
  level: level,
  /** Optionele casus die boven de vraag staat */
  case: z.string().optional(),
  prompt: z.string().min(5),
  /** Algemene waarom-uitleg, getoond na beantwoorden */
  explanation: z.string().min(20),
  sourceRefs: z.array(sourceRef).min(1),
  /** Herkomst: "nieuw" of de oorspronkelijke oefentoets, bv. "Oefentoets H1 vraag 4" */
  origin: z.string().default('nieuw'),
  ...meta,
})

export const mcQuestion = questionBase.extend({
  type: z.literal('mc'),
  options: z
    .array(
      z.object({
        id: z.string().regex(/^[a-d]$/),
        text: z.string().min(1),
        /** Waarom deze keuze juist of onjuist is */
        feedback: z.string().min(5),
      }),
    )
    .min(2)
    .max(4),
  correctAnswer: z.string().regex(/^[a-d]$/),
})

export const tfQuestion = questionBase.extend({
  type: z.literal('truefalse'),
  correctAnswer: z.boolean(),
  feedbackTrue: z.string().min(5),
  feedbackFalse: z.string().min(5),
})

export const matchQuestion = questionBase.extend({
  type: z.literal('match'),
  /** Juiste koppelingen. De app schudt de rechterkolom. */
  pairs: z.array(z.object({ left: z.string(), right: z.string() })).min(3).max(6),
})

export const orderQuestion = questionBase.extend({
  type: z.literal('order'),
  /** Items in de JUISTE volgorde. De app schudt ze. */
  items: z.array(z.string()).min(3).max(7),
})

export const question = z.discriminatedUnion('type', [mcQuestion, tfQuestion, matchQuestion, orderQuestion])
export type Question = z.infer<typeof question>
export type McQuestion = z.infer<typeof mcQuestion>

// ---------- Lessen ----------

export const screen = z.discriminatedUnion('type', [
  z.object({ type: z.literal('objectives'), title: z.string().default('Leerdoelen') }),
  z.object({
    type: z.literal('text'),
    title: z.string(),
    /** Alinea's gescheiden door een lege regel. Ondersteunt **vet** en regels die met "- " beginnen (lijst). */
    body: z.string().min(20),
  }),
  z.object({
    type: z.literal('law'),
    title: z.string(),
    ref: sourceRef,
    /** Inhoud van het artikel in eigen woorden (geen letterlijk citaat tenzij gecontroleerd) */
    body: z.string().min(20),
  }),
  z.object({
    type: z.literal('keypoints'),
    title: z.string(),
    items: z.array(z.object({ term: z.string(), text: z.string() })).min(2),
  }),
  z.object({ type: z.literal('example'), title: z.string(), body: z.string().min(20) }),
  z.object({ type: z.literal('exercise'), title: z.string().default('Oefening'), questionId: z.string() }),
  z.object({ type: z.literal('check'), title: z.string().default('Kennischeck'), questionIds: z.array(z.string()).min(1) }),
  z.object({ type: z.literal('summary'), title: z.string().default('Samenvatting') }),
])
export type Screen = z.infer<typeof screen>

export const lesson = z.object({
  id: z.string().regex(/^m\d{2}-l\d{2}$/),
  moduleId: z.string().regex(/^m\d{2}$/),
  order: z.number().int().positive(),
  title: z.string().min(3),
  minutes: z.number().int().min(5).max(30),
  termIds: z.array(z.string()).default([]),
  objectives: z.array(z.object({ text: z.string(), level: level })).min(1),
  screens: z.array(screen).min(1),
  summary: z.array(z.string()).min(1),
  sourceRefs: z.array(sourceRef).min(1),
  ...meta,
})
export type Lesson = z.infer<typeof lesson>

export const glossaryEntry = z.object({
  term: z.string(),
  definition: z.string().min(10),
  moduleId: z.string().regex(/^m\d{2}$/),
  sourceRefs: z.array(sourceRef).default([]),
  reviewStatus: reviewStatus,
})
export type GlossaryEntry = z.infer<typeof glossaryEntry>

export const moduleContent = z.object({
  moduleId: z.string().regex(/^m\d{2}$/),
  lessons: z.array(lesson).default([]),
  questions: z.array(question).default([]),
  glossary: z.array(glossaryEntry).default([]),
})
export type ModuleContent = z.infer<typeof moduleContent>

// ---------- Curriculum ----------

export const term = z.object({
  id: z.string().regex(/^\d\.\d\.\d$/),
  moduleId: z.string(),
  description: z.string(),
  level: level,
  sourcePage: z.string().optional(),
  groupId: z.string().optional(),
})

export const curriculum = z.object({
  title: z.string(),
  version: z.string(),
  peildatum: z.string(),
  matrix: z.object({
    name: z.string(),
    status: z.enum(['ingelezen', 'bron_ontbreekt']),
    note: z.string(),
  }),
  exam: z.object({
    totalQuestions: z.number().int(),
    durationMinutes: z.number().int(),
    passPercentage: z.number(),
    source: z.string(),
  }),
  modules: z.array(
    z.object({
      id: z.string().regex(/^m\d{2}$/),
      number: z.number().int(),
      title: z.string(),
      short: z.string(),
      termRange: z.string(),
      topics: z.array(z.string()),
    }),
  ),
  /** Officiële examentermen; vullen uit de PHB-toetsmatrijs */
  terms: z.array(term),
  /** Officiële aantallen per examenterm of groep */
  examGroups: z.array(z.object({ id: z.string(), label: z.string(), termIds: z.array(z.string()), questionCount: z.number().int() })),
})
export type Curriculum = z.infer<typeof curriculum>
