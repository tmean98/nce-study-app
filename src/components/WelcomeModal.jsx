import { useState } from 'react'

const STEPS = [
  {
    eyebrow: 'Welcome',
    title: 'Your NCE Study Platform',
    body: (
      <>
        <p>This platform was built specifically for graduate counseling students preparing for the National Counselor Examination (NCE) and CPCE. Everything is organized around the 8 CACREP domains tested on the actual exam.</p>
        <div className="wm-stats">
          <div className="wm-stat"><span className="wm-stat-num">1,099</span><span className="wm-stat-label">Quiz Questions</span></div>
          <div className="wm-stat"><span className="wm-stat-num">493</span><span className="wm-stat-label">Flashcards</span></div>
          <div className="wm-stat"><span className="wm-stat-num">10</span><span className="wm-stat-label">Chapters</span></div>
          <div className="wm-stat"><span className="wm-stat-num">8</span><span className="wm-stat-label">CACREP Domains</span></div>
        </div>
      </>
    ),
  },
  {
    eyebrow: 'The Content',
    title: 'Built from the Source',
    body: (
      <>
        <p>Every question is taken verbatim from <em>Howard Rosenthal's Encyclopedia of Counseling, 4th edition</em> — the gold standard NCE prep resource used by counseling programs nationwide.</p>
        <p>Questions are parsed directly from the book, including the original answer choices. Rosenthal's own explanations appear as the rationale shown after each answer — so you're learning from the source, not a paraphrase.</p>
        <div className="wm-source-note">
          <span className="wm-source-icon">📖</span>
          <span>Chapters 3–12 · 1,099 verbatim questions · Rationale from the original text</span>
        </div>
      </>
    ),
  },
  {
    eyebrow: 'Your Study Plan',
    title: 'Three Modes, One Goal',
    body: (
      <>
        <div className="wm-modes">
          <div className="wm-mode">
            <div className="wm-mode-num">01</div>
            <div>
              <p className="wm-mode-title">Flashcards</p>
              <p className="wm-mode-desc">Learn key terms and concepts chapter by chapter. Flip to reveal definitions. Star cards for review.</p>
            </div>
          </div>
          <div className="wm-mode">
            <div className="wm-mode-num">02</div>
            <div>
              <p className="wm-mode-title">Chapter Quiz</p>
              <p className="wm-mode-desc">Test yourself on a chapter with instant right/wrong feedback and Rosenthal's rationale after each answer.</p>
            </div>
          </div>
          <div className="wm-mode">
            <div className="wm-mode-num">03</div>
            <div>
              <p className="wm-mode-title">Practice Exam</p>
              <p className="wm-mode-desc">Simulate the full NCE — 200 questions, 4 hours, CACREP-weighted. No feedback until you submit.</p>
            </div>
          </div>
        </div>
        <p className="wm-tip">Start with flashcards to build vocabulary, move to chapter quizzes, then test yourself with the full exam.</p>
      </>
    ),
  },
]

export default function WelcomeModal({ onClose }) {
  const [step, setStep] = useState(0)
  const s = STEPS[step]
  const isLast = step === STEPS.length - 1

  function handleClose() {
    localStorage.setItem('nce_onboarded', '1')
    onClose()
  }

  return (
    <div className="wm-overlay" onClick={handleClose}>
      <div className="wm-modal" onClick={e => e.stopPropagation()}>

        <div className="wm-header">
          <div className="wm-dots">
            {STEPS.map((_, i) => (
              <button
                key={i}
                className={`wm-dot${i === step ? ' active' : ''}`}
                onClick={() => setStep(i)}
              />
            ))}
          </div>
          <button className="wm-close" onClick={handleClose}>✕</button>
        </div>

        <div className="wm-content">
          <p className="wm-eyebrow">{s.eyebrow}</p>
          <h2 className="wm-title">{s.title}</h2>
          <div className="wm-body">{s.body}</div>
        </div>

        <div className="wm-footer">
          {step > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => setStep(s => s - 1)}>
              ← Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {isLast ? (
            <button className="wm-cta" onClick={handleClose}>
              Get Started →
            </button>
          ) : (
            <button className="wm-cta" onClick={() => setStep(s => s + 1)}>
              Next →
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
