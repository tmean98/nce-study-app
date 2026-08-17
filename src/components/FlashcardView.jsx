import { useState } from 'react'

const LETTERS = ['A', 'B', 'C', 'D', 'E']

export default function FlashcardView({ cards, chapterName, onBack }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [shuffled] = useState(() => [...cards].sort(() => Math.random() - 0.5))

  const card = shuffled[index]
  const total = shuffled.length

  function next() {
    setFlipped(false)
    setTimeout(() => setIndex(i => Math.min(i + 1, total - 1)), flipped ? 200 : 0)
  }

  function prev() {
    setFlipped(false)
    setTimeout(() => setIndex(i => Math.max(i - 1, 0)), flipped ? 200 : 0)
  }

  return (
    <div className="study-view">
      <div className="study-header">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <h2>{chapterName} — Flashcards</h2>
      </div>

      <div className="progress-label">{index + 1} / {total}</div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      <div className="flip-card" onClick={() => setFlipped(f => !f)}>
        <div className={`flip-card-inner${flipped ? ' flipped' : ''}`}>
          <div className="flip-card-front">
            <div className="card-label">Term</div>
            <div className="card-term">{card.front}</div>
            <div className="card-domain">{card.domain}</div>
          </div>
          <div className="flip-card-back">
            <div className="card-label">Definition</div>
            <div className="card-definition">{card.back}</div>
            {card.confusable_with && (
              <div className="card-hint">Don't confuse with: {card.confusable_with}</div>
            )}
            <div className="card-domain">{card.domain}</div>
          </div>
        </div>
      </div>

      <div className="card-tap-hint">Click card to flip</div>

      <div className="flashcard-controls">
        <button className="btn btn-secondary" onClick={prev} disabled={index === 0}>← Prev</button>
        <button className="btn btn-primary" onClick={next} disabled={index === total - 1}>Next →</button>
      </div>
    </div>
  )
}
