import { useState, useEffect } from 'react'
import FlashcardView from './components/FlashcardView'
import QuizView from './components/QuizView'
import ExamView from './components/ExamView'
import Leaderboard from './components/Leaderboard'
import LandingPage from './components/LandingPage'
import { supabase } from './lib/supabase'
import './App.css'

const EXAM_DOMAINS = [
  { chId: 'ch03', count: 24 },
  { chId: 'ch04', count: 22 },
  { chId: 'ch05', count: 52 },
  { chId: 'ch06', count: 14 },
  { chId: 'ch07', count: 22 },
  { chId: 'ch08', count: 26 },
  { chId: 'ch09', count: 16 },
  { chId: 'ch10', count: 24 },
]

const CHAPTERS = [
  { id: 'ch03', name: 'Ch 3',  num: '03', title: 'Human Growth & Development',       questions: 100 },
  { id: 'ch04', name: 'Ch 4',  num: '04', title: 'Social & Cultural Diversity',       questions: 100 },
  { id: 'ch05', name: 'Ch 5',  num: '05', title: 'Helping Relationships',             questions: 199 },
  { id: 'ch06', name: 'Ch 6',  num: '06', title: 'Group Work',                        questions: 100 },
  { id: 'ch07', name: 'Ch 7',  num: '07', title: 'Career Development',               questions: 100 },
  { id: 'ch08', name: 'Ch 8',  num: '08', title: 'Assessment & Testing',             questions: 100 },
  { id: 'ch09', name: 'Ch 9',  num: '09', title: 'Research & Program Evaluation',    questions: 100 },
  { id: 'ch10', name: 'Ch 10', num: '10', title: 'Professional Orientation & Ethics', questions: 100 },
  { id: 'ch11', name: 'Ch 11', num: '11', title: 'Family Therapy, Career & Research', questions: 100 },
  { id: 'ch12', name: 'Ch 12', num: '12', title: 'Neuro, CBT Waves, DBT, MI & ACT',  questions: 100 },
]

export default function App() {
  const [view, setView] = useState('home')
  const [activeChapter, setActiveChapter] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(undefined) // undefined = still checking

  useEffect(() => {
    if (!supabase) { setUser(null); return }
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function openView(ch, mode) {
    setLoading(true)
    const res = await fetch(`/${ch.id}_${mode}.json`)
    const json = await res.json()
    setData(json)
    setActiveChapter(ch)
    setView(mode === 'flashcards' ? 'flashcards' : 'quiz')
    setLoading(false)
  }

  async function openExam() {
    setLoading(true)
    const allData = await Promise.all(
      EXAM_DOMAINS.map(({ chId }) => fetch(`/${chId}_quiz.json`).then(r => r.json()))
    )
    const pool = []
    allData.forEach((questions, i) => {
      const { count } = EXAM_DOMAINS[i]
      const shuffled = [...questions].sort(() => Math.random() - 0.5)
      pool.push(...shuffled.slice(0, Math.min(count, shuffled.length)))
    })
    setData(pool.sort(() => Math.random() - 0.5))
    setView('exam')
    setLoading(false)
  }

  function goHome() { setView('home'); setData(null); setActiveChapter(null) }

  const chapterLabel = activeChapter ? `${activeChapter.name}: ${activeChapter.title}` : ''

  // Still checking auth — render nothing to avoid flash
  if (user === undefined) return null

  // Not logged in — show landing page
  if (!user) {
    return (
      <div className="app">
        <LandingPage />
      </div>
    )
  }

  // Logged in views
  if (view === 'flashcards' && data) {
    return (
      <div className="app">
        <Header user={user} onSignOut={() => supabase?.auth.signOut()} />
        <FlashcardView cards={data} chapterName={chapterLabel} onBack={goHome} />
      </div>
    )
  }

  if (view === 'quiz' && data) {
    return (
      <div className="app">
        <Header user={user} onSignOut={() => supabase?.auth.signOut()} />
        <QuizView
          questions={data}
          chapterName={chapterLabel}
          chapterId={activeChapter.id}
          onBack={goHome}
          user={user}
        />
      </div>
    )
  }

  if (view === 'exam' && data) {
    return (
      <div className="app">
        <Header user={user} onSignOut={() => supabase?.auth.signOut()} />
        <ExamView questions={data} onBack={goHome} user={user} />
      </div>
    )
  }

  if (view === 'leaderboard') {
    return (
      <div className="app">
        <Header user={user} onSignOut={() => supabase?.auth.signOut()} />
        <Leaderboard onBack={goHome} />
      </div>
    )
  }

  return (
    <div className="app">
      <Header user={user} onSignOut={() => supabase?.auth.signOut()} />
      <main className="home">

        {/* ── Exam Hero ── */}
        <div className="exam-hero">
          <div className="exam-hero-body">
            <span className="exam-hero-eyebrow">Full-Length Practice Exam</span>
            <h2 className="exam-hero-title">NCE Qualifying Exam</h2>
            <div className="exam-hero-meta">
              <span>200 Questions</span>
              <span className="exam-hero-dot">·</span>
              <span>4 Hours</span>
              <span className="exam-hero-dot">·</span>
              <span>8 CACREP Domains</span>
            </div>
            <p className="exam-hero-desc">Simulate the real thing. See where you stand.</p>
          </div>
          <button className="exam-hero-btn" onClick={openExam} disabled={loading}>
            {loading ? 'Loading…' : 'Begin Exam →'}
          </button>
        </div>

        {/* ── Stats strip ── */}
        <div className="home-stats">
          <div className="stat-item">
            <span className="stat-num">1,099</span>
            <span className="stat-label">Quiz Questions</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">493</span>
            <span className="stat-label">Flashcards</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">10</span>
            <span className="stat-label">Chapters</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">8</span>
            <span className="stat-label">CACREP Domains</span>
          </div>
        </div>

        {/* ── Chapter list ── */}
        <div className="chapter-section-header">
          <h3 className="chapter-section-title">Study by Chapter</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setView('leaderboard')}>Leaderboard</button>
        </div>
        <div className="chapter-list">
          {CHAPTERS.map(ch => (
            <div key={ch.id} className="chapter-row">
              <div className="chapter-row-num">{ch.num}</div>
              <div className="chapter-row-info">
                <h3 className="chapter-row-title">{ch.title}</h3>
                <p className="chapter-row-meta">50 Flashcards · {ch.questions} Questions</p>
              </div>
              <div className="chapter-row-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => openView(ch, 'flashcards')}>Flashcards</button>
                <button className="btn btn-primary btn-sm" onClick={() => openView(ch, 'quiz')}>Quiz</button>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}

function Header({ user, onSignOut }) {
  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-mark">NCE</span>
        <span className="header-brand-text">Study Platform</span>
      </div>
      <div className="header-right">
        <span className="header-user">{user.user_metadata?.display_name || user.email.split('@')[0]}</span>
        <button className="btn btn-ghost btn-sm" onClick={onSignOut}>Sign Out</button>
      </div>
    </header>
  )
}
