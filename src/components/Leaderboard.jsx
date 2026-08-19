import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const CHAPTERS = [
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

export default function Leaderboard({ onBack }) {
  const [filter, setFilter] = useState('all')
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    async function fetch() {
      setLoading(true)
      let q = supabase
        .from('quiz_scores')
        .select('display_name, chapter_name, score, total, percentage, created_at')
        .order('percentage', { ascending: false })
        .limit(50)
      if (filter !== 'all') q = q.eq('chapter_id', filter)
      const { data } = await q
      setScores(data || [])
      setLoading(false)
    }
    fetch()
  }, [filter])

  return (
    <div className="leaderboard-view">
      <div className="study-header">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <h2>Leaderboard</h2>
      </div>

      <div className="lb-filters">
        {CHAPTERS.map(ch => (
          <button
            key={ch.id}
            className={`lb-filter-btn${filter === ch.id ? ' active' : ''}`}
            onClick={() => setFilter(ch.id)}
          >
            {ch.label}
          </button>
        ))}
      </div>

      {!supabase ? (
        <p className="lb-empty">Leaderboard not configured yet.</p>
      ) : loading ? (
        <p className="lb-empty">Loading…</p>
      ) : scores.length === 0 ? (
        <p className="lb-empty">No scores yet. Be the first!</p>
      ) : (
        <div className="lb-table">
          <div className="lb-row lb-header">
            <span>#</span>
            <span>Name</span>
            <span>Chapter</span>
            <span>Score</span>
          </div>
          {scores.map((s, i) => (
            <div key={i} className={`lb-row${i < 3 ? ' lb-top' : ''}`}>
              <span className="lb-rank">{i + 1}</span>
              <span>{s.display_name || 'Anonymous'}</span>
              <span className="lb-chapter">{s.chapter_name}</span>
              <span className="lb-score">{s.percentage}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
