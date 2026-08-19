import { useState } from 'react'
import { useStarred } from '../lib/useStarred'
import FlagModal from './FlagModal'

export default function FlashcardView({ cards, chapterName, onBack }) {
  const [shuffled] = useState(() => [...cards].sort(() => Math.random() - 0.5))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [starredOnly, setStarredOnly] = useState(false)
  const [flagged, setFlagged] = useState(null)
  const { starred, toggle } = useStarred()

  const pool = starredOnly ? shuffled.filter(c => starred.has(c.id)) : shuffled
  const card = pool[index]
  const total = pool.length

  function go(dir) {
    setFlipped(false)
    setTimeout(() => setIndex(i => Math.max(0, Math.min(i + dir, total - 1))), flipped ? 180 : 0)
  }

  if (starredOnly && total === 0) {
    return (
      <div className="study-view">
        <div className="study-header">
          <button className="btn btn-ghost" onClick={onBack}>← Back</button>
          <h2>{chapterName}</h2>
        </div>
        <div className="empty-state">
          <p>No starred cards in this chapter yet.</p>
          <button className="btn btn-secondary" onClick={() => { setStarredOnly(false); setIndex(0) }}>
            Show All Cards
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="study-view">
      <div className="study-header">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <h2 className="study-title">{chapterName} — Flashcards</h2>
      </div>

      <div className="card-toolbar">
        <button
          className={`toolbar-btn${starredOnly ? ' active' : ''}`}
          onClick={() => { setStarredOnly(s => !s); setIndex(0); setFlipped(false) }}
        >
          ★ {starredOnly ? 'All Cards' : `Starred (${starred.size})`}
        </button>
        <span className="progress-label">{index + 1} / {total}</span>
      </div>

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

      <div className="card-tap-hint">Tap card to flip</div>

      <div className="flashcard-controls">
        <button className="btn btn-secondary" onClick={() => go(-1)} disabled={index === 0}>← Prev</button>

        <div className="card-actions">
          <button
            className={`icon-btn star-btn${starred.has(card.id) ? ' starred' : ''}`}
            onClick={() => toggle(card.id)}
            title={starred.has(card.id) ? 'Unstar' : 'Star for review'}
          >
            {starred.has(card.id) ? '★' : '☆'}
          </button>
          <button
            className="icon-btn flag-btn"
            onClick={() => setFlagged(card)}
            title="Flag this card"
          >
            ⚑
          </button>
        </div>

        <button className="btn btn-primary" onClick={() => go(1)} disabled={index === total - 1}>Next →</button>
      </div>

      {flagged && <FlagModal item={flagged} type="card" onClose={() => setFlagged(null)} />}
    </div>
  )
}
