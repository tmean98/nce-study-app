import { useState, useEffect } from 'react'
import FlashcardView from './components/FlashcardView'
import QuizView from './components/QuizView'
import AuthModal from './components/AuthModal'
import Leaderboard from './components/Leaderboard'
import { supabase } from './lib/supabase'
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
  const [view, setView] = useState('home')
  const [activeChapter, setActiveChapter] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    if (!supabase) return
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

  function goHome() { setView('home'); setData(null); setActiveChapter(null) }

  const chapterLabel = activeChapter ? `${activeChapter.name}: ${activeChapter.title}` : ''

  if (view === 'flashcards' && data) {
    return (
      <div className="app">
        <Header user={user} onAuth={() => setShowAuth(true)} onSignOut={() => supabase?.auth.signOut()} />
        <FlashcardView cards={data} chapterName={chapterLabel} onBack={goHome} />
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    )
  }

  if (view === 'quiz' && data) {
    return (
      <div className="app">
        <Header user={user} onAuth={() => setShowAuth(true)} onSignOut={() => supabase?.auth.signOut()} />
        <QuizView
          questions={data}
          chapterName={chapterLabel}
          chapterId={activeChapter.id}
          onBack={goHome}
          user={user}
        />
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    )
  }

  if (view === 'leaderboard') {
    return (
      <div className="app">
        <Header user={user} onAuth={() => setShowAuth(true)} onSignOut={() => supabase?.auth.signOut()} />
        <Leaderboard onBack={goHome} />
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    )
  }

  return (
    <div className="app">
      <Header user={user} onAuth={() => setShowAuth(true)} onSignOut={() => supabase?.auth.signOut()} />
      <main className="home">
        <div className="home-top">
          <div>
            <h2>NCE / CPCE Study</h2>
            <p className="home-subtitle">
              {loading ? 'Loading…' : '493 flashcards · 200 quiz questions across 10 chapters'}
            </p>
          </div>
          <button className="btn btn-secondary" onClick={() => setView('leaderboard')}>🏆 Leaderboard</button>
        </div>
        <div className="chapter-grid">
          {CHAPTERS.map(ch => (
            <div key={ch.id} className="chapter-card">
              <h3>{ch.name}: {ch.title}</h3>
              <p>50 flashcards · 20 quiz questions</p>
              <div className="chapter-card-actions">
                <button className="btn btn-primary" onClick={() => openView(ch, 'flashcards')}>Flashcards</button>
                <button className="btn btn-secondary" onClick={() => openView(ch, 'quiz')}>Quiz</button>
              </div>
            </div>
          ))}
        </div>
      </main>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}

function Header({ user, onAuth, onSignOut }) {
  return (
    <header className="header">
      <h1>NCE Study</h1>
      <div className="header-right">
        {user ? (
          <>
            <span className="header-user">{user.email.split('@')[0]}</span>
            <button className="btn btn-ghost btn-sm" onClick={onSignOut}>Sign Out</button>
          </>
        ) : (
          <button className="btn btn-secondary btn-sm" onClick={onAuth}>Sign In</button>
        )}
      </div>
    </header>
  )
}
