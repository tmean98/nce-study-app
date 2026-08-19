import { useState } from 'react'
import FlagModal from './FlagModal'
import { supabase } from '../lib/supabase'
import { useStarred } from '../lib/useStarred'

const LETTERS = ['A', 'B', 'C', 'D', 'E']
const SESSION_SIZES = [10, 20, 40]

function buildPool(questions, size, masteredSet, mode, starredSet, starredOnly) {
  let source = questions
  if (starredOnly) source = questions.filter(q => starredSet.has(q.id))
  else if (mode === 'unmastered') source = questions.filter(q => !masteredSet.has(q.id))
  const shuffled = [...source].sort(() => Math.random() - 0.5)
  return size === 'All' ? shuffled : shuffled.slice(0, Math.min(size, shuffled.length))
}

export default function QuizView({ questions, chapterName, chapterId, onBack, user, mastery, markMastered, addMissed, missedIds }) {
  const [sessionSize, setSessionSize] = useState(null)
  const [sessionMode, setSessionMode] = useState('unmastered')
  const [pool, setPool] = useState([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [flagged, setFlagged] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [starredOnly, setStarredOnly] = useState(false)
  const { starred, toggle } = useStarred()

  const masteredSet = mastery || new Set()
  const masteredCount = questions.filter(q => masteredSet.has(q.id)).length
  const unmasteredCount = questions.length - masteredCount
  const masteryPct = Math.round((masteredCount / questions.length) * 100)
  const allMastered = unmasteredCount === 0

  const q = pool[index]
  const total = pool.length
  const answered = selected !== null

  function startSession(size, mode) {
    setSessionSize(size)
    setSessionMode(mode)
    setPool(buildPool(questions, size, masteredSet, mode, starred, starredOnly))
    setIndex(0); setSelected(null); setScore(0); setDone(false); setSaved(false)
  }

  function choose(i) {
    if (answered) return
    setSelected(i)
    if (i === q.correct_index) {
      setScore(s => s + 1)
      markMastered?.(q.id, chapterId)
    } else {
      addMissed?.(q, chapterId)
    }
  }

  function next() {
    if (index + 1 >= total) setDone(true)
    else { setIndex(i => i + 1); setSelected(null) }
  }

  async function saveScore() {
    if (!supabase || !user || saved) return
    setSaving(true)
    const pct = Math.round((score / total) * 100)
    await supabase.from('quiz_scores').insert({
      user_id: user.id,
      display_name: user.user_metadata?.display_name || user.email.split('@')[0],
      chapter_id: chapterId,
      chapter_name: chapterName,
      score,
      total,
      percentage: pct,
    })
    setSaved(true)
    setSaving(false)
  }

  function restart() {
    setSessionSize(null)
    setPool([])
    setIndex(0); setSelected(null); setScore(0); setDone(false); setSaved(false)
  }

  // ── Start screen ──────────────────────────────────────────────────────────
  if (!sessionSize) {
    const starredCount = questions.filter(q => starred.has(q.id)).length
    const unmasteredSizes = SESSION_SIZES.filter(s => s < unmasteredCount)

    return (
      <div className="quiz-view">
        <div className="study-header">
          <button className="btn btn-ghost" onClick={onBack}>← Back</button>
          <h2 className="study-title">{chapterName} — Quiz</h2>
        </div>

        <div className="quiz-start">

          {/* Mastery bar */}
          <div className="mastery-progress">
            <div className="mastery-progress-header">
              <span className="mastery-progress-label">
                {allMastered ? '✓ Chapter Complete — All Questions Mastered' : 'Mastery Progress'}
              </span>
              <span className="mastery-progress-count">{masteredCount} / {questions.length}</span>
            </div>
            <div className="mastery-bar-wrap">
              <div className="mastery-bar-fill" style={{ width: `${masteryPct}%` }} />
            </div>
          </div>

          {!allMastered ? (
            <>
              {/* Primary: unmastered */}
              <p className="quiz-section-label">Study unmastered — {unmasteredCount} left</p>
              <p className="quiz-session-note">
                Questions are drawn randomly from your unmastered pool. Each correct answer permanently marks that question as mastered — keep going until you reach 0.
              </p>
              <div className="quiz-size-grid">
                {unmasteredSizes.map(s => (
                  <button key={s} className="btn btn-secondary quiz-size-btn"
                    onClick={() => { setStarredOnly(false); startSession(s, 'unmastered') }}>
                    {s}
                  </button>
                ))}
                <button className="btn btn-secondary quiz-size-btn"
                  onClick={() => { setStarredOnly(false); startSession('All', 'unmastered') }}>
                  All {unmasteredCount}
                </button>
              </div>

              {/* Secondary: review all */}
              <div className="quiz-section-divider" />
              <p className="quiz-section-label quiz-section-label-dim">Review all {questions.length} questions</p>
              <div className="quiz-size-grid">
                {SESSION_SIZES.map(s => (
                  <button key={s} className="btn btn-ghost quiz-size-btn"
                    onClick={() => { setStarredOnly(false); startSession(s, 'all') }}>
                    {s}
                  </button>
                ))}
                <button className="btn btn-ghost quiz-size-btn"
                  onClick={() => { setStarredOnly(false); startSession('All', 'all') }}>
                  All {questions.length}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mastery-complete-note">
                You've mastered every question in this chapter. Keep reviewing to stay sharp.
              </p>
              <div className="quiz-size-grid">
                {SESSION_SIZES.map(s => (
                  <button key={s} className="btn btn-secondary quiz-size-btn"
                    onClick={() => { setStarredOnly(false); startSession(s, 'all') }}>
                    {s}
                  </button>
                ))}
                <button className="btn btn-secondary quiz-size-btn"
                  onClick={() => { setStarredOnly(false); startSession('All', 'all') }}>
                  All {questions.length}
                </button>
              </div>
            </>
          )}

          {starredCount > 0 && (
            <button className="btn btn-ghost quiz-starred-btn"
              onClick={() => { setStarredOnly(true); startSession('All', 'all') }}>
              ★ Starred only ({starredCount})
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Empty pool ────────────────────────────────────────────────────────────
  if (total === 0) {
    return (
      <div className="quiz-view">
        <div className="study-header">
          <button className="btn btn-ghost" onClick={onBack}>← Back</button>
          <h2 className="study-title">{chapterName} — Quiz</h2>
        </div>
        <div className="empty-state">
          <p>No questions in this set.</p>
          <button className="btn btn-secondary" onClick={restart}>Back to Start</button>
        </div>
      </div>
    )
  }

  // ── Score screen ──────────────────────────────────────────────────────────
  if (done) {
    const pct = Math.round((score / total) * 100)
    const updatedMastered = questions.filter(q => masteredSet.has(q.id)).length
    return (
      <div className="score-screen">
        <div className="score-circle">
          <div className="score-number">{score}</div>
          <div className="score-total">out of {total}</div>
        </div>
        <h2>{pct >= 75 ? 'Great work!' : pct >= 50 ? 'Keep studying!' : 'More review needed'}</h2>
        <p>{pct}% correct on {chapterName}</p>
        <p className="score-mastery-note">
          {updatedMastered} / {questions.length} questions mastered in this chapter
        </p>

        {supabase && user && !saved && !starredOnly && (
          <div className="save-score-box">
            <p>Save to leaderboard as <strong>{user.user_metadata?.display_name || user.email.split('@')[0]}</strong>?</p>
            <button className="btn btn-success" onClick={saveScore} disabled={saving}>
              {saving ? 'Saving…' : 'Save Score'}
            </button>
          </div>
        )}
        {saved && <p className="save-confirmed">Score saved!</p>}

        <div className="score-actions">
          <button className="btn btn-secondary" onClick={onBack}>← Chapters</button>
          <button className="btn btn-primary" onClick={restart}>New Session</button>
        </div>
      </div>
    )
  }

  // ── Quiz in progress ──────────────────────────────────────────────────────
  return (
    <div className="quiz-view">
      <div className="study-header">
        <button className="btn btn-ghost" onClick={restart}>← Back</button>
        <h2 className="study-title">{chapterName} — Quiz</h2>
      </div>

      <div className="card-toolbar">
        <span className="progress-label">{index + 1} / {total}</span>
        <span className="progress-label">Score: {score}</span>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      <div className="quiz-question-box">
        <div className="quiz-q-header">
          <div className="quiz-q-number">
            Question {index + 1}
            {masteredSet.has(q.id)
              ? <span className="q-status-badge q-badge-review">✓ Review</span>
              : missedIds?.has(q.id)
                ? <span className="q-status-badge q-badge-missed">Previously missed</span>
                : null}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className={`icon-btn star-btn${starred.has(q.id) ? ' starred' : ''}`}
              onClick={() => toggle(q.id)}
              title={starred.has(q.id) ? 'Unstar' : 'Star for review'}
            >
              {starred.has(q.id) ? '★' : '☆'}
            </button>
            <button className="icon-btn flag-btn" onClick={() => setFlagged(q)} title="Flag this question">⚑</button>
          </div>
        </div>
        <div className="quiz-question-text">{q.question}</div>
      </div>

      <div className="quiz-options">
        {q.options.map((opt, i) => {
          let cls = 'quiz-option'
          if (answered) {
            if (i === q.correct_index) cls += selected === i ? ' correct' : ' revealed-correct'
            else if (i === selected) cls += ' incorrect'
          }
          return (
            <button key={i} className={cls} onClick={() => choose(i)} disabled={answered}>
              <span className="option-letter">{LETTERS[i]}</span>
              <span>{opt}</span>
            </button>
          )
        })}
      </div>

      {answered && (
        <div className="quiz-rationale">
          <strong>Rationale</strong>
          {q.rationale}
        </div>
      )}

      {answered && (
        <div className="quiz-controls">
          <button className="btn btn-primary" onClick={next}>
            {index + 1 >= total ? 'See Results' : 'Next Question →'}
          </button>
        </div>
      )}

      {flagged && <FlagModal item={flagged} type="question" onClose={() => setFlagged(null)} />}
    </div>
  )
}
