import { useState } from 'react'
import FlashcardView from './components/FlashcardView'
import QuizView from './components/QuizView'
import './App.css'

const CHAPTERS = [
  { id: 'ch03', name: 'Ch 3', title: 'Human Growth & Development' },
  { id: 'ch04', name: 'Ch 4', title: 'Social & Cultural Diversity' },
  { id: 'ch05', name: 'Ch 5', title: 'Helping Relationships' },
  { id: 'ch06', name: 'Ch 6', title: 'Group Work' },
  { id: 'ch07', name: 'Ch 7', title: 'Career Development' },
  { id: 'ch08', name: 'Ch 8', title: 'Assessment & Testing' },
  { id: 'ch09', name: 'Ch 9', title: 'Research & Program Evaluation' },
  { id: 'ch10', name: 'Ch 10', title: 'Professional Orientation & Ethics' },
  { id: 'ch11', name: 'Ch 11', title: 'Family Therapy, Career & Research' },
  { id: 'ch12', name: 'Ch 12', title: 'Neuro, CBT Waves, DBT, MI & ACT' },
]

export default function App() {
  const [view, setView] = useState('home') // 'home' | 'flashcards' | 'quiz'
  const [activeChapter, setActiveChapter] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  async function openFlashcards(ch) {
    setLoading(true)
    const res = await fetch(`/${ch.id}_flashcards.json`)
    const cards = await res.json()
    setData(cards)
    setActiveChapter(ch)
    setView('flashcards')
    setLoading(false)
  }

  async function openQuiz(ch) {
    setLoading(true)
    const res = await fetch(`/${ch.id}_quiz.json`)
    const questions = await res.json()
    setData(questions)
    setActiveChapter(ch)
    setView('quiz')
    setLoading(false)
  }

  function goHome() {
    setView('home')
    setData(null)
    setActiveChapter(null)
  }

  if (view === 'flashcards' && data) {
    return (
      <div className="app">
        <header className="header">
          <h1>NCE Study</h1>
          <span className="header-badge">Flashcards</span>
        </header>
        <FlashcardView cards={data} chapterName={`${activeChapter.name}: ${activeChapter.title}`} onBack={goHome} />
      </div>
    )
  }

  if (view === 'quiz' && data) {
    return (
      <div className="app">
        <header className="header">
          <h1>NCE Study</h1>
          <span className="header-badge">Quiz</span>
        </header>
        <QuizView questions={data} chapterName={`${activeChapter.name}: ${activeChapter.title}`} onBack={goHome} />
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1>NCE Study</h1>
        <span className="header-badge">NCE / CPCE Prep</span>
      </header>
      <main className="home">
        <h2>Choose a Chapter</h2>
        <p className="home-subtitle">
          {loading ? 'Loading…' : '493 flashcards · 200 quiz questions across 10 chapters'}
        </p>
        <div className="chapter-grid">
          {CHAPTERS.map(ch => (
            <div key={ch.id} className="chapter-card">
              <h3>{ch.name}: {ch.title}</h3>
              <p>Flashcards + Quiz</p>
              <div className="chapter-card-actions">
                <button className="btn btn-primary" onClick={() => openFlashcards(ch)}>Flashcards</button>
                <button className="btn btn-secondary" onClick={() => openQuiz(ch)}>Quiz</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
