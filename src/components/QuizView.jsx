import { useState } from 'react'

const LETTERS = ['A', 'B', 'C', 'D', 'E']

export default function QuizView({ questions, chapterName, onBack }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [shuffled] = useState(() => [...questions].sort(() => Math.random() - 0.5))

  const q = shuffled[index]
  const total = shuffled.length
  const answered = selected !== null

  function choose(i) {
    if (answered) return
    setSelected(i)
    if (i === q.correct_index) setScore(s => s + 1)
  }

  function next() {
    if (index + 1 >= total) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setSelected(null)
    }
  }

  function restart() {
    setIndex(0)
    setSelected(null)
    setScore(0)
    setDone(false)
  }

  if (done) {
    const pct = Math.round((score / total) * 100)
    return (
      <div className="score-screen">
        <div className="score-circle">
          <div className="score-number">{score}</div>
          <div className="score-total">out of {total}</div>
        </div>
        <h2>{pct >= 75 ? 'Great work!' : pct >= 50 ? 'Keep studying!' : 'More review needed'}</h2>
        <p>{pct}% correct on {chapterName}</p>
        <div className="score-actions">
          <button className="btn btn-secondary" onClick={onBack}>← Chapters</button>
          <button className="btn btn-primary" onClick={restart}>Retake Quiz</button>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-view">
      <div className="study-header">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <h2>{chapterName} — Quiz</h2>
      </div>

      <div className="progress-label">{index + 1} / {total}</div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      <div className="quiz-question-box">
        <div className="quiz-q-number">Question {index + 1}</div>
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
    </div>
  )
}
