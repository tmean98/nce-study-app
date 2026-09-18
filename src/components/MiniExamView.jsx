import { useState, useEffect, useRef } from 'react'

const LETTERS = ['A', 'B', 'C', 'D']

const DOMAIN_LABELS = {
  'Human Growth and Development': 'Human Growth & Development',
  'Social and Cultural Foundations': 'Social & Cultural Diversity',
  'Helping Relationships': 'Helping Relationships',
  'Group Work': 'Group Work',
  'Career Development': 'Career Development',
  'Assessment and Testing': 'Assessment & Testing',
  'Research and Program Evaluation': 'Research & Program Evaluation',
  'Professional Orientation and Ethics': 'Professional Orientation & Ethics',
  'Human Growth & Development': 'Human Growth & Development',
  'Social & Cultural Diversity': 'Social & Cultural Diversity',
  'Assessment & Testing': 'Assessment & Testing',
  'Research & Program Evaluation': 'Research & Program Evaluation',
  'Professional Orientation & Ethics': 'Professional Orientation & Ethics',
  'Family Therapy': 'Family Therapy',
  'Career & Research': 'Career & Research',
  'Neuro, CBT, DBT, MI & ACT': 'Neuro, CBT, DBT, MI & ACT',
}

export default function MiniExamView({ questions, onBack, seenCount, totalCount, wasReset, addMissed }) {
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)
  const [reviewIndex, setReviewIndex] = useState(0)
  const addedMissedRef = useRef(false)

  useEffect(() => {
    if (!submitted || !addMissed || addedMissedRef.current) return
    addedMissedRef.current = true
    questions.filter(q => answers[q.id] !== q.correct_index).forEach(q => {
      addMissed(q, `ch${String(q.chapter).padStart(2, '0')}`)
    })
  }, [submitted])

  const q = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const unansweredCount = questions.length - answeredCount

  function selectAnswer(i) {
    setAnswers(prev => ({ ...prev, [q.id]: i }))
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
    const prevSeen = seenCount - questions.length
    return (
      <div className="exam-prestart">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <span className="mini-exam-pre-eyebrow">⚡ Quick Practice</span>
        <h2 className="exam-prestart-title">Mini Exam</h2>
        <p className="exam-prestart-subtitle">20 questions · All domains · No timer · Interruptable</p>

        {wasReset && (
          <div className="mini-exam-reset-notice">
            You've seen all {totalCount} questions — starting a fresh cycle!
          </div>
        )}

        <div className="exam-info-grid">
          <div className="exam-info-card">
            <div className="exam-info-num">20</div>
            <div className="exam-info-label">Questions</div>
          </div>
          <div className="exam-info-card">
            <div className="exam-info-num">—</div>
            <div className="exam-info-label">No Timer</div>
          </div>
          <div className="exam-info-card">
            <div className="exam-info-num">{totalCount}</div>
            <div className="exam-info-label">Total Pool</div>
          </div>
        </div>

        <div className="mini-exam-pre-progress">
          <div className="mini-pre-progress-header">
            <span className="mini-pre-progress-label">QUESTION PROGRESS</span>
            <span className="mini-pre-progress-nums">{prevSeen} / {totalCount}</span>
          </div>
          <div className="mini-pre-progress-bar-wrap">
            <div className="mini-pre-progress-bar-fill" style={{ width: `${(prevSeen / totalCount) * 100}%` }} />
          </div>
          <p className="mini-pre-progress-sub">
            After this session: {seenCount} / {totalCount} seen
          </p>
        </div>

        <p className="exam-prestart-note">
          Questions are drawn from all domains with no repeats. You'll cycle through all {totalCount} questions before seeing any again. No feedback is shown until you submit.
        </p>
        <button className="btn btn-primary exam-start-btn" onClick={() => setStarted(true)}>
          Begin Mini Exam
        </button>
      </div>
    )
  }

  // ── Results screen ────────────────────────────────────────────────────────
  if (submitted) {
    const totalCorrect = questions.filter(q => answers[q.id] === q.correct_index).length
    const pct = Math.round((totalCorrect / questions.length) * 100)
    const missedQuestions = questions.filter(q => answers[q.id] !== q.correct_index)

    // ── Review mode ───────────────────────────────────────────────────────────
    if (reviewMode && missedQuestions.length > 0) {
      const rq = missedQuestions[reviewIndex]
      const userAnswer = answers[rq.id]
      return (
        <div className="exam-review">
          <div className="exam-review-header">
            <button className="btn btn-ghost btn-sm" onClick={() => setReviewMode(false)}>← Back to Results</button>
            <span className="exam-review-counter">Missed {reviewIndex + 1} / {missedQuestions.length}</span>
          </div>
          <div className="quiz-question-box">
            <div className="quiz-q-header">
              <div className="quiz-q-number">Question {reviewIndex + 1}</div>
              <span className="exam-review-domain">{DOMAIN_LABELS[rq.domain] || rq.domain}</span>
            </div>
            <div className="quiz-question-text">{rq.question}</div>
          </div>
          <div className="quiz-options">
            {rq.options.map((opt, i) => {
              let cls = 'quiz-option'
              if (i === rq.correct_index) cls += userAnswer === i ? ' correct' : ' revealed-correct'
              else if (i === userAnswer) cls += ' incorrect'
              return (
                <button key={i} className={cls} disabled>
                  <span className="option-letter">{LETTERS[i]}</span>
                  <span>{opt}</span>
                </button>
              )
            })}
          </div>
          {rq.rationale && (
            <div className="quiz-rationale">
              <strong>Rationale:</strong> {rq.rationale}
            </div>
          )}
          <div className="exam-review-nav">
            <button className="btn btn-ghost" onClick={() => setReviewIndex(i => i - 1)} disabled={reviewIndex === 0}>← Prev</button>
            <button className="btn btn-ghost" onClick={() => setReviewIndex(i => i + 1)} disabled={reviewIndex === missedQuestions.length - 1}>Next →</button>
          </div>
        </div>
      )
    }

    const domainResults = {}
    questions.forEach(q => {
      const label = DOMAIN_LABELS[q.domain] || q.domain
      if (!domainResults[label]) domainResults[label] = { correct: 0, total: 0 }
      domainResults[label].total++
      if (answers[q.id] === q.correct_index) domainResults[label].correct++
    })

    const sortedDomains = Object.entries(domainResults)
      .map(([domain, { correct, total }]) => ({ domain, correct, total, pct: Math.round((correct / total) * 100) }))
      .sort((a, b) => b.pct - a.pct)

    return (
      <div className="exam-results">
        <h2 className="exam-results-title">Mini Exam Complete</h2>

        <div className="exam-score-circle" style={{ borderColor: pct >= 70 ? '#22c55e' : pct >= 56 ? '#D4A84F' : '#ef4444' }}>
          <div className="exam-score-num">{totalCorrect}</div>
          <div className="exam-score-denom">/ {questions.length}</div>
        </div>
        <div className={`exam-score-pct ${pct >= 70 ? 'pass' : pct >= 56 ? 'borderline' : 'fail'}`}>
          {pct}%{pct >= 70 ? ' — Strong' : pct >= 56 ? ' — Passing Range' : ' — Keep Practicing'}
        </div>

        <div className="mini-exam-seen-summary">
          <span className="mini-seen-label">QUESTION PROGRESS</span>
          <span className="mini-seen-nums">{seenCount} / {totalCount} seen</span>
          <div className="mini-seen-bar-wrap">
            <div className="mini-seen-bar-fill" style={{ width: `${(seenCount / totalCount) * 100}%` }} />
          </div>
          <p className="mini-seen-sub">{totalCount - seenCount} questions remaining in this cycle</p>
        </div>

        {sortedDomains.length > 1 && (
          <>
            <h3 className="exam-domain-results-title">Performance by Domain</h3>
            <div className="exam-domain-results">
              {sortedDomains.map(({ domain, correct, total, pct: dPct }) => (
                <div key={domain} className="exam-domain-result-row">
                  <div className="exam-domain-result-name">{domain}</div>
                  <div className="exam-domain-result-bar-wrap">
                    <div
                      className={`exam-domain-result-bar ${dPct >= 56 ? 'bar-pass' : 'bar-fail'}`}
                      style={{ width: `${dPct}%` }}
                    />
                  </div>
                  <div className="exam-domain-result-score">
                    {correct}/{total} <span className="exam-domain-pct">({dPct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {missedQuestions.length > 0 && (
          <button className="btn btn-primary" style={{ marginTop: '8px' }} onClick={() => { setReviewMode(true); setReviewIndex(0) }}>
            Review {missedQuestions.length} Missed Question{missedQuestions.length !== 1 ? 's' : ''} →
          </button>
        )}

        <div className="mini-exam-result-actions">
          <button className="btn btn-secondary" onClick={onBack}>← Back to Home</button>
          <button className="btn btn-ghost" onClick={onBack}>
            Start Another →
          </button>
        </div>
        <p className="mini-exam-result-hint">Click "Start Another" then "Mini Exam" again to continue your cycle.</p>
      </div>
    )
  }

  // ── Exam in progress ──────────────────────────────────────────────────────
  const selectedAnswer = answers[q.id]

  return (
    <div className="exam-view">
      {/* Header */}
      <div className="exam-header">
        <div className="mini-exam-header-left">
          <span className="mini-exam-header-label">MINI EXAM</span>
          <span className="mini-exam-seen-chip">{seenCount} / {totalCount} seen</span>
        </div>
        <div className="exam-progress">
          Q {currentIndex + 1} / {questions.length}
          <span className="exam-answered-count"> · {answeredCount} answered</span>
        </div>
        <div className="exam-header-right">
          <button className="btn btn-ghost btn-sm" onClick={() => setShowPalette(true)}>
            Grid
          </button>
          <button className="btn btn-ghost btn-sm exam-abandon-btn" onClick={() => setConfirmExit(true)}>
            ✕ Exit
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
        </div>
        <div className="quiz-question-text">{q.question}</div>
      </div>

      {/* Options */}
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
          Submit
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
              <span className="legend-item"><span className="palette-dot dot-unanswered" /> Unanswered</span>
            </div>
            <div className="palette-grid">
              {questions.map((pq, i) => {
                const isAnswered = answers[pq.id] !== undefined
                const isCurrent = i === currentIndex
                let cls = 'palette-btn'
                if (isCurrent) cls += ' palette-current'
                else if (isAnswered) cls += ' palette-answered'
                return (
                  <button key={pq.id} className={cls} onClick={() => jumpTo(i)}>
                    {i + 1}
                  </button>
                )
              })}
            </div>
            <div className="palette-summary">
              {answeredCount} answered · {unansweredCount} remaining
            </div>
          </div>
        </div>
      )}

      {/* Exit modal */}
      {confirmExit && (
        <div className="palette-overlay" onClick={() => setConfirmExit(false)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <h3>Exit Mini Exam?</h3>
            <p>Your answers won't be scored. These 20 questions have already been marked as seen in your cycle.</p>
            <div className="confirm-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmExit(false)}>Keep Going</button>
              <button className="btn btn-danger" onClick={onBack}>Exit</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm submit modal */}
      {confirmSubmit && (
        <div className="palette-overlay" onClick={() => setConfirmSubmit(false)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <h3>Submit Mini Exam?</h3>
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
