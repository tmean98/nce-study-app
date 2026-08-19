import { useState, useEffect } from 'react'
import FlashcardView from './components/FlashcardView'
import QuizView from './components/QuizView'
import ExamView from './components/ExamView'
import Leaderboard from './components/Leaderboard'
import LandingPage from './components/LandingPage'
import WelcomeModal from './components/WelcomeModal'
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

const QUOTES = [
  { text: "Excellence is the gradual result of always striving to do better.", author: "Pat Riley" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Preparation is the key to success.", author: "Alexander Graham Bell" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
]
const quote = QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length]

export default function App() {
  const [view, setView] = useState('home')
  const [activeChapter, setActiveChapter] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(undefined) // undefined = still checking
  const [userStats, setUserStats] = useState(null)
  const [chapterScores, setChapterScores] = useState({})
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (!supabase) { setUser(null); return }
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user && localStorage.getItem(`nce_onboarded_${user.id}`) !== 'dismissed') {
      setShowWelcome(true)
    }
  }, [user])

  useEffect(() => {
    // Always reset on user change so stale data from a previous session never bleeds through
    setUserStats(null)
    setChapterScores({})
    if (!supabase || !user) return
    async function fetchStats() {
      const { data: rows, error } = await supabase
        .from('quiz_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error || !rows || rows.length === 0) return

      const totalAnswered = rows.reduce((sum, r) => sum + (r.total || 0), 0)
      const avgScore = Math.round(rows.reduce((sum, r) => sum + (r.percentage || 0), 0) / rows.length)

      // Best % per chapter
      const bestByChapter = {}
      rows.forEach(r => {
        const key = r.chapter_id
        if (!bestByChapter[key] || r.percentage > bestByChapter[key]) {
          bestByChapter[key] = r.percentage
        }
      })
      const allChapterIds = CHAPTERS.map(c => c.id)
      const overallPct = Math.round(
        allChapterIds.reduce((sum, id) => sum + (bestByChapter[id] || 0), 0) / allChapterIds.length
      )

      const scores = {}
      Object.entries(bestByChapter).forEach(([id, pct]) => {
        scores[id] = { bestPct: pct }
      })
      setChapterScores(scores)

      const mostRecent = rows[0]
      setUserStats({
        totalAnswered,
        avgScore,
        overallPct,
        recentChapterId: mostRecent.chapter_id,
        recentChapterName: mostRecent.chapter_name,
      })
    }
    fetchStats()
  }, [user])

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

  const displayName = user.user_metadata?.display_name || user.email.split('@')[0]
  const recentChapter = userStats
    ? CHAPTERS.find(c => c.id === userStats.recentChapterId)
    : null
  const recentChapterScore = recentChapter && chapterScores[recentChapter.id]
    ? chapterScores[recentChapter.id].bestPct
    : null

  return (
    <div className="app">
      {showWelcome && (
        <WelcomeModal
          onClose={() => setShowWelcome(false)}
          onDontShowAgain={() => { localStorage.setItem(`nce_onboarded_${user.id}`, 'dismissed'); setShowWelcome(false) }}
        />
      )}
      <Header user={user} onSignOut={() => supabase?.auth.signOut()} onHelp={() => setShowWelcome(true)} />

      {view === 'flashcards' && data && (
        <FlashcardView cards={data} chapterName={chapterLabel} onBack={goHome} />
      )}
      {view === 'quiz' && data && (
        <QuizView questions={data} chapterName={chapterLabel} chapterId={activeChapter.id} onBack={goHome} user={user} />
      )}
      {view === 'exam' && data && (
        <ExamView questions={data} onBack={goHome} user={user} />
      )}
      {view === 'leaderboard' && (
        <Leaderboard onBack={goHome} />
      )}
      {view === 'home' && (
      <main className="home">
        <div className="home-layout">

          {/* ── Sidebar ── */}
          <aside className="home-sidebar">

            {/* Greeting */}
            <div>
              <p className="greeting-eyebrow">WELCOME BACK,</p>
              <p className="greeting-name">{displayName}</p>
            </div>

            {/* Progress Stats */}
            <div className="sidebar-section">
              <p className="sidebar-label">YOUR PROGRESS</p>
              <div className="progress-stats-grid">
                <div className="pstat">
                  <span className="pstat-num">{userStats ? `${userStats.overallPct}%` : '—'}</span>
                  <span className="pstat-label">Overall Progress</span>
                </div>
                <div className="pstat">
                  <span className="pstat-num">{userStats ? userStats.totalAnswered : '—'}</span>
                  <span className="pstat-label">Questions Answered</span>
                </div>
                <div className="pstat">
                  <span className="pstat-num">{userStats ? `${userStats.avgScore}%` : '—'}</span>
                  <span className="pstat-label">Average Score</span>
                </div>
                <div className="pstat">
                  <span className="pstat-num">—</span>
                  <span className="pstat-label">Day Streak</span>
                </div>
              </div>
            </div>

            {/* Continue Studying */}
            {userStats && recentChapter && (
              <div className="sidebar-section">
                <p className="sidebar-label">CONTINUE STUDYING</p>
                <div className="continue-card">
                  <p className="continue-card-title">Ch {recentChapter.num}: {recentChapter.title}</p>
                  <div className="continue-bar-wrap">
                    <div className="continue-bar" style={{ width: `${recentChapterScore || 0}%` }} />
                  </div>
                  <div className="continue-card-footer">
                    <span className="continue-pct">{recentChapterScore != null ? `${recentChapterScore}%` : '—'}</span>
                    <button className="ch-link ch-link-primary" onClick={() => openView(recentChapter, 'quiz')}>
                      Continue →
                    </button>
                  </div>
                </div>
              </div>
            )}


          </aside>

          {/* ── Main Content ── */}
          <div className="home-main">

            {/* Exam Hero */}
            <div className="exam-hero">
              <div className="exam-hero-stamp">NCE<br/>PRACTICE<br/>EXAM</div>
              <span className="exam-hero-eyebrow">📋 Full-Length Practice Exam</span>
              <h2 className="exam-hero-title">NCE<br/>QUALIFYING EXAM</h2>
              <div className="exam-hero-specs">
                <div className="exam-spec">
                  <span className="exam-spec-icon">📋</span>
                  <span className="exam-spec-num">200</span>
                  <span className="exam-spec-label">Questions</span>
                </div>
                <div className="exam-spec-divider" />
                <div className="exam-spec">
                  <span className="exam-spec-icon">🕐</span>
                  <span className="exam-spec-num">4</span>
                  <span className="exam-spec-label">Hours</span>
                </div>
              </div>
              <p className="exam-hero-desc">Simulate the real thing. See where you stand.</p>
              <button className="exam-hero-cta" onClick={openExam} disabled={loading}>
                {loading ? 'LOADING…' : 'BEGIN EXAM →'}
              </button>
            </div>

            {/* Chapter Grid */}
            <div>
              <div className="chapter-grid-header">
                <span className="chapter-grid-label">STUDY BY CHAPTER</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setView('leaderboard')}>Leaderboard</button>
              </div>
              <div className="chapter-grid">
                {CHAPTERS.map(ch => {
                  const score = chapterScores[ch.id]
                  const bestPct = score ? score.bestPct : null
                  const started = bestPct != null
                  return (
                    <div key={ch.id} className="chapter-card">
                      <div className="chapter-card-num">{ch.num}</div>
                      <div>
                        <p className="chapter-card-title">{ch.title}</p>
                        <p className="chapter-card-meta">50 FLASHCARDS · {ch.questions} QUESTIONS</p>
                        <div className="chapter-card-bar-wrap">
                          <div className="chapter-card-bar" style={{ width: `${bestPct || 0}%` }} />
                        </div>
                        <div className="chapter-card-footer">
                          <span className="chapter-card-score">
                            {started ? `${bestPct}% best score` : 'Not started'}
                          </span>
                          <div className="chapter-card-actions">
                            <button className="ch-link" onClick={() => openView(ch, 'flashcards')}>Cards</button>
                            <button className="ch-link ch-link-primary" onClick={() => openView(ch, 'quiz')}>
                              {started ? 'Continue →' : 'Start →'}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="chapter-card-pct" style={{ color: started ? '#2F6FED' : '#1E3048' }}>
                        {started ? `${bestPct}%` : '—'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </main>
      )}
    </div>
  )
}

function Header({ user, onSignOut, onHelp }) {
  return (
    <header className="header">
      <div className="header-brand">
        <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
          <path d="M10 1L2 4.5V10.5C2 15.1 5.4 19.4 10 21C14.6 19.4 18 15.1 18 10.5V4.5L10 1Z" stroke="#D4A84F" strokeWidth="1.5" fill="none"/>
          <path d="M7 11L9 13L13 9" stroke="#D4A84F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="header-mark">NCE STUDY</span>
      </div>
      <div className="header-right">
        <span className="header-user">{user.user_metadata?.display_name || user.email.split('@')[0]}</span>
        <button className="btn-help" onClick={onHelp} title="Platform guide">?</button>
        <button className="btn btn-ghost btn-sm" onClick={onSignOut}>Sign Out</button>
      </div>
    </header>
  )
}
