import { useState, useEffect, useRef } from 'react'

const LETTERS = ['A', 'B', 'C', 'D']
const EXAM_DURATION = 4 * 60 * 60 // 14400 seconds

const DOMAIN_LABELS = {
  'Human Growth and Development': 'Human Growth & Development',
  'Social and Cultural Foundations': 'Social & Cultural Diversity',
  'Helping Relationships': 'Helping Relationships',
  'Group Work': 'Group Work',
  'Career Development': 'Career Development',
  'Assessment and Testing': 'Assessment & Testing',
  'Research and Program Evaluation': 'Research & Program Evaluation',
  'Professional Orientation and Ethics': 'Professional Orientation & Ethics',
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function ExamView({ questions, onBack }) {
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState({})
  const [flagged, setFlagged] = useState(new Set())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION)
  const [submitted, setSubmitted] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const [confirmAbandon, setConfirmAbandon] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const timeLeftRef = useRef(EXAM_DURATION)

  useEffect(() => {
    if (!started || submitted) return
    const interval = setInterval(() => {
      timeLeftRef.current -= 1
      setTimeLeft(timeLeftRef.current)
      if (timeLeftRef.current <= 0) {
        clearInterval(interval)
        setSubmitted(true)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [started, submitted])

  const q = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const unansweredCount = questions.length - answeredCount
  const isLowTime = timeLeft < 600 // under 10 minutes

  function selectAnswer(i) {
    setAnswers(prev => ({ ...prev, [q.id]: i }))
  }

  function toggleFlag() {
    setFlagged(prev => {
      const next = new Set(prev)
      next.has(q.id) ? next.delete(q.id) : next.add(q.id)
      return next
    })
  }

  function jumpTo(i) {
    setCurrentIndex(i)
    setShowPalette(false)
  }

  function trySubmit() {
    if (unansweredCount > 0) setConfirmSubmit(true)
    else setSubmitted(true)
  }

  // ── Pre-start screen ──────────────────────────────────────────────────────
  if (!started) {
    const domainCounts = {}
    questions.forEach(q => {
      const label = DOMAIN_LABELS[q.domain] || q.domain
      domainCounts[label] = (domainCounts[label] || 0) + 1
    })
    return (
      <div className="exam-prestart">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <h2 className="exam-prestart-title">NCE Practice Exam</h2>
        <p className="exam-prestart-subtitle">Simulated full-length exam · CACREP-weighted</p>

        <div className="exam-info-grid">
          <div className="exam-info-card">
            <div className="exam-info-num">200</div>
            <div className="exam-info-label">Questions</div>
          </div>
          <div className="exam-info-card">
            <div className="exam-info-num">4:00</div>
            <div className="exam-info-label">Hours</div>
          </div>
          <div className="exam-info-card">
            <div className="exam-info-num">8</div>
            <div className="exam-info-label">CACREP Domains</div>
          </div>
        </div>

        <div className="exam-domain-table">
          <div className="exam-domain-header">
            <span>Domain</span><span>Questions</span>
          </div>
          {Object.entries(domainCounts).map(([domain, count]) => (
            <div key={domain} className="exam-domain-row">
              <span>{domain}</span>
              <span>{count}</span>
            </div>
          ))}
        </div>

        <p className="exam-prestart-note">
          You will not see correct/incorrect feedback until you submit. You can flag questions and navigate freely.
        </p>
        <button className="btn btn-primary exam-start-btn" onClick={() => setStarted(true)}>
          Begin Exam
        </button>
      </div>
    )
  }

  // ── Results screen ────────────────────────────────────────────────────────
  if (submitted) {
    const timeSpent = EXAM_DURATION - timeLeft
    const totalCorrect = questions.filter(q => answers[q.id] === q.correct_index).length
    const pct = Math.round((totalCorrect / questions.length) * 100)

    const domainResults = {}
    questions.forEach(q => {
      const label = DOMAIN_LABELS[q.domain] || q.domain
      if (!domainResults[label]) domainResults[label] = { correct: 0, total: 0 }
      domainResults[label].total++
      if (answers[q.id] === q.correct_index) domainResults[label].correct++
    })

    const passingThreshold = 70

    return (
      <div className="exam-results">
        <h2 className="exam-results-title">Exam Complete</h2>
        <div className="exam-score-circle">
          <div className="exam-score-num">{totalCorrect}</div>
          <div className="exam-score-denom">/ {questions.length}</div>
        </div>
        <div className={`exam-score-pct ${pct >= passingThreshold ? 'pass' : 'fail'}`}>
          {pct}% — {pct >= passingThreshold ? 'Passing' : 'Below Passing'}
        </div>
        <p className="exam-time-spent">Time used: {formatTime(timeSpent)}</p>
        <p className="exam-passing-note">NCE passing is a scaled score; ~70% is a general benchmark</p>

        <h3 className="exam-domain-results-title">Results by Domain</h3>
        <div className="exam-domain-results">
          {Object.entries(domainResults).map(([domain, { correct, total }]) => {
            const dpct = Math.round((correct / total) * 100)
            return (
              <div key={domain} className="exam-domain-result-row">
                <div className="exam-domain-result-name">{domain}</div>
                <div className="exam-domain-result-bar-wrap">
                  <div
                    className={`exam-domain-result-bar ${dpct >= passingThreshold ? 'bar-pass' : 'bar-fail'}`}
                    style={{ width: `${dpct}%` }}
                  />
                </div>
                <div className="exam-domain-result-score">
                  {correct}/{total} <span className="exam-domain-pct">({dpct}%)</span>
                </div>
              </div>
            )
          })}
        </div>

        <button className="btn btn-secondary" onClick={onBack}>← Back to Home</button>
      </div>
    )
  }

  // ── Exam in progress ──────────────────────────────────────────────────────
  const selectedAnswer = answers[q.id]
  const isFlagged = flagged.has(q.id)

  return (
    <div className="exam-view">
      {/* Header */}
      <div className="exam-header">
        <div className={`exam-timer ${isLowTime ? 'timer-low' : ''}`}>
          {formatTime(timeLeft)}
        </div>
        <div className="exam-progress">
          Q {currentIndex + 1} / {questions.length}
          <span className="exam-answered-count"> · {answeredCount} answered</span>
        </div>
        <div className="exam-header-right">
          <button className="btn btn-ghost btn-sm" onClick={() => setShowPalette(true)}>
            Grid
          </button>
          <button className="btn btn-ghost btn-sm exam-abandon-btn" onClick={() => setConfirmAbandon(true)}>
            ✕ Abandon
          </button>
        </div>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="quiz-question-box">
        <div className="quiz-q-header">
          <div className="quiz-q-number">Question {currentIndex + 1}</div>
          <button
            className={`icon-btn flag-btn${isFlagged ? ' flagged' : ''}`}
            onClick={toggleFlag}
            title={isFlagged ? 'Remove flag' : 'Flag for review'}
          >
            {isFlagged ? '⚑' : '⚐'}
          </button>
        </div>
        <div className="quiz-question-text">{q.question}</div>
      </div>

      {/* Options — no feedback */}
      <div className="quiz-options">
        {q.options.map((opt, i) => (
          <button
            key={i}
            className={`quiz-option${selectedAnswer === i ? ' exam-selected' : ''}`}
            onClick={() => selectAnswer(i)}
          >
            <span className="option-letter">{LETTERS[i]}</span>
            <span>{opt}</span>
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="exam-nav">
        <button
          className="btn btn-ghost"
          onClick={() => setCurrentIndex(i => i - 1)}
          disabled={currentIndex === 0}
        >
          ← Prev
        </button>
        <button className="btn btn-danger" onClick={trySubmit}>
          Submit Exam
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => setCurrentIndex(i => i + 1)}
          disabled={currentIndex === questions.length - 1}
        >
          Next →
        </button>
      </div>

      {/* Question palette overlay */}
      {showPalette && (
        <div className="palette-overlay" onClick={() => setShowPalette(false)}>
          <div className="palette-modal" onClick={e => e.stopPropagation()}>
            <div className="palette-header">
              <h3>Question Navigator</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPalette(false)}>✕</button>
            </div>
            <div className="palette-legend">
              <span className="legend-item"><span className="palette-dot dot-answered" /> Answered</span>
              <span className="legend-item"><span className="palette-dot dot-flagged" /> Flagged</span>
              <span className="legend-item"><span className="palette-dot dot-unanswered" /> Unanswered</span>
            </div>
            <div className="palette-grid">
              {questions.map((pq, i) => {
                const isAnswered = answers[pq.id] !== undefined
                const isFlagged = flagged.has(pq.id)
                const isCurrent = i === currentIndex
                let cls = 'palette-btn'
                if (isCurrent) cls += ' palette-current'
                else if (isFlagged) cls += ' palette-flagged'
                else if (isAnswered) cls += ' palette-answered'
                return (
                  <button key={pq.id} className={cls} onClick={() => jumpTo(i)}>
                    {i + 1}
                  </button>
                )
              })}
            </div>
            <div className="palette-summary">
              {answeredCount} answered · {flagged.size} flagged · {unansweredCount} remaining
            </div>
          </div>
        </div>
      )}

      {/* Abandon exam modal */}
      {confirmAbandon && (
        <div className="palette-overlay" onClick={() => setConfirmAbandon(false)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <h3>Abandon Exam?</h3>
            <p>Your progress will not be saved. You'll return to the home screen and can start a fresh exam whenever you're ready.</p>
            <div className="confirm-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmAbandon(false)}>Keep Going</button>
              <button className="btn btn-danger" onClick={onBack}>Abandon</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm submit modal */}
      {confirmSubmit && (
        <div className="palette-overlay" onClick={() => setConfirmSubmit(false)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <h3>Submit Exam?</h3>
            <p>You have <strong>{unansweredCount}</strong> unanswered question{unansweredCount !== 1 ? 's' : ''}. Unanswered questions will be marked incorrect.</p>
            <div className="confirm-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmSubmit(false)}>Keep Going</button>
              <button className="btn btn-danger" onClick={() => setSubmitted(true)}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
