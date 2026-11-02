import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { QuestionCard } from './QuestionCard'
import type { Question } from '../content/schema'

const q: Question = {
  id: 'q-m01-l01-99',
  moduleId: 'm01',
  termIds: [],
  topic: 'Test',
  level: 'K',
  type: 'mc',
  prompt: 'Wie stelt de APV vast?',
  options: [
    { id: 'a', text: 'De burgemeester', feedback: 'Nee, de burgemeester handhaaft de openbare orde.' },
    { id: 'b', text: 'De gemeenteraad', feedback: 'Ja, de raad maakt verordeningen.' },
  ],
  correctAnswer: 'b',
  explanation: 'De gemeenteraad stelt verordeningen vast, waaronder de APV.',
  sourceRefs: [{ law: 'Gemeentewet', article: 'art. 147' }],
  origin: 'nieuw',
  reviewStatus: 'concept',
  version: '1.0',
  lastModified: '2026-11-02',
}

describe('QuestionCard', () => {
  it('controleert een meerkeuzevraag en toont waarom-uitleg, bron en reviewstatus', () => {
    const onAnswered = vi.fn()
    render(<QuestionCard question={q} onAnswered={onAnswered} />)
    const check = screen.getByRole('button', { name: 'Controleer antwoord' })
    expect(check).toBeDisabled()
    fireEvent.click(screen.getByLabelText(/De burgemeester/))
    fireEvent.click(check)
    expect(onAnswered).toHaveBeenCalledWith(false)
    expect(screen.getByText('Niet goed.')).toBeInTheDocument()
    expect(screen.getByText(/Ja, de raad maakt verordeningen/)).toBeInTheDocument()
    expect(screen.getByText(/art. 147 Gemeentewet/)).toBeInTheDocument()
    expect(screen.getAllByText(/Concept/).length).toBeGreaterThan(0)
  })
})
