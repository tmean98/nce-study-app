import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const CHAPTER_FILTERS = [
  { id: 'all', label: 'All Chapters' },
  { id: 'ch03', label: 'Ch 3' },
  { id: 'ch04', label: 'Ch 4' },
  { id: 'ch05', label: 'Ch 5' },
  { id: 'ch06', label: 'Ch 6' },
  { id: 'ch07', label: 'Ch 7' },
  { id: 'ch08', label: 'Ch 8' },
  { id: 'ch09', label: 'Ch 9' },
  { id: 'ch10', label: 'Ch 10' },
  { id: 'ch11', label: 'Ch 11' },
  { id: 'ch12', label: 'Ch 12' },
]

export default function Leaderboard({ onBack, user }) {
  const [tab, setTab] = useState('chapters')
  const [chapterFilter, setChapterFilter] = useState('all')
  const [allScores, setAllScores] = useState([])
  const [loading, setLoading] = useState(true)

  const currentUserName = user?.user_metadata?.display_name || user?.email?.split('@')[0]

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('quiz_scores')
        .select('display_name, chapter_id, chapter_name, score, total, percentage')
        .order('percentage', { ascending: false })
        .limit(2000)
      setAllScores(data || [])
      setLoading(false)
    }
    load()
  }, [])

  // Split into chapter scores vs exam scores
  const chapterScores = allScores.filter(s => s.chapter_id !== 'exam')
  const examScores = allScores.filter(s => s.chapter_id === 'exam')

  // Best score per (user, chapter) — deduplicate
  const bestPerUserChapter = {}
  chapterScores.forEach(s => {
    const key = `${s.display_name}__${s.chapter_id}`
    if (!bestPerUserChapter[key] || s.percentage > bestPerUserChapter[key].percentage) {
      bestPerUserChapter[key] = s
    }
  })

  // Chapter tab rows
  let chapterRows
  if (chapterFilter === 'all') {
    // Average each user's best score across all chapters they've attempted
    const byUser = {}
    Object.values(bestPerUserChapter).forEach(s => {
      if (!byUser[s.display_name]) byUser[s.display_name] = { display_name: s.display_name, total: 0, count: 0 }
      byUser[s.display_name].total += s.percentage
      byUser[s.display_name].count++
    })
    chapterRows = Object.values(byUser)
      .map(u => ({
        display_name: u.display_name,
        percentage: Math.round(u.total / u.count),
        detail: `${u.count} chapter${u.count !== 1 ? 's' : ''}`,
      }))
      .sort((a, b) => b.percentage - a.percentage)
  } else {
    chapterRows = Object.values(bestPerUserChapter)
      .filter(s => s.chapter_id === chapterFilter)
      .map(s => ({ display_name: s.display_name, percentage: s.percentage, detail: `${s.score} / ${s.total}` }))
      .sort((a, b) => b.percentage - a.percentage)
  }

  // Exam tab rows — best score per user
  const bestExamPerUser = {}
  examScores.forEach(s => {
    if (!bestExamPerUser[s.display_name] || s.percentage > bestExamPerUser[s.display_name].percentage) {
      bestExamPerUser[s.display_name] = s
    }
  })
  const examRows = Object.values(bestExamPerUser)
    .map(s => ({ display_name: s.display_name, percentage: s.percentage, detail: `${s.score} / ${s.total}` }))
    .sort((a, b) => b.percentage - a.percentage)

  const rows = tab === 'exam' ? examRows : chapterRows

  return (
    <div className="leaderboard-view">
      <div className="study-header">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <h2>Leaderboard</h2>
      </div>

      {/* Top-level tabs */}
      <div className="lb-tabs">
        <button className={`lb-tab${tab === 'chapters' ? ' active' : ''}`} onClick={() => setTab('chapters')}>
          Chapter Quizzes
        </button>
        <button className={`lb-tab${tab === 'exam' ? ' active' : ''}`} onClick={() => setTab('exam')}>
          Practice Exam
        </button>
      </div>

      {/* Chapter filter strip */}
      {tab === 'chapters' && (
        <div className="lb-filters">
          {CHAPTER_FILTERS.map(ch => (
            <button
              key={ch.id}
              className={`lb-filter-btn${chapterFilter === ch.id ? ' active' : ''}`}
              onClick={() => setChapterFilter(ch.id)}
            >
              {ch.label}
            </button>
          ))}
        </div>
      )}

      {!supabase ? (
        <p className="lb-empty">Leaderboard not configured yet.</p>
      ) : loading ? (
        <p className="lb-empty">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="lb-empty">No scores yet. Be the first!</p>
      ) : (
        <div className="lb-table">
          <div className="lb-row lb-header">
            <span>#</span>
            <span>Name</span>
            <span>{tab === 'exam' ? 'Score' : chapterFilter === 'all' ? 'Avg Best %' : 'Score'}</span>
            <span>{tab === 'exam' || chapterFilter !== 'all' ? 'Correct' : 'Chapters'}</span>
          </div>
          {rows.map((s, i) => {
            const isCurrentUser = s.display_name === currentUserName
            return (
              <div key={i} className={`lb-row${i < 3 ? ' lb-top' : ''}${isCurrentUser ? ' lb-me' : ''}`}>
                <span className="lb-rank">{i + 1}</span>
                <span>{s.display_name || 'Anonymous'}{isCurrentUser ? ' (you)' : ''}</span>
                <span className="lb-score">{s.percentage}%</span>
                <span className="lb-chapter">{s.detail}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
