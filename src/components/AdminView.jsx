import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const CHAPTER_NAMES = {
  ch03: 'Human Growth & Development',
  ch04: 'Social & Cultural Diversity',
  ch05: 'Helping Relationships',
  ch06: 'Group Work',
  ch07: 'Career Development',
  ch08: 'Assessment & Testing',
  ch09: 'Research & Program Evaluation',
  ch10: 'Professional Orientation & Ethics',
  ch11: 'Family Therapy, Career & Research',
  ch12: 'Neuro, CBT Waves, DBT, MI & ACT',
  exam: 'Practice Exam',
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminView({ onBack }) {
  const [rows, setRows] = useState(null)
  const [users, setUsers] = useState(null)
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: scores } = await supabase
        .from('quiz_scores')
        .select('*')
        .order('created_at', { ascending: false })

      setRows(scores || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="admin-loading">Loading admin data…</div>

  // Aggregate per user
  const userMap = {}
  rows.forEach(r => {
    if (!userMap[r.user_id]) {
      userMap[r.user_id] = {
        id: r.user_id,
        name: r.display_name || r.user_id.slice(0, 8),
        scores: [],
        examScores: [],
        lastActive: r.created_at,
      }
    }
    userMap[r.user_id].scores.push(r)
    if (r.chapter_id === 'exam') userMap[r.user_id].examScores.push(r)
    if (r.created_at > userMap[r.user_id].lastActive) {
      userMap[r.user_id].lastActive = r.created_at
    }
  })

  const userList = Object.values(userMap).sort((a, b) =>
    new Date(b.lastActive) - new Date(a.lastActive)
  )

  const totalSessions = rows.length
  const uniqueUsers = userList.length
  const examAttempts = rows.filter(r => r.chapter_id === 'exam').length
  const avgExamPct = examAttempts > 0
    ? Math.round(rows.filter(r => r.chapter_id === 'exam').reduce((s, r) => s + r.percentage, 0) / examAttempts)
    : null

  return (
    <div className="admin-view">
      <div className="admin-header">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <h2 className="admin-title">Admin Dashboard</h2>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat">
          <div className="admin-stat-num">{uniqueUsers}</div>
          <div className="admin-stat-label">Total Users</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-num">{totalSessions}</div>
          <div className="admin-stat-label">Quiz Sessions</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-num">{examAttempts}</div>
          <div className="admin-stat-label">Exam Attempts</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-num">{avgExamPct != null ? `${avgExamPct}%` : '—'}</div>
          <div className="admin-stat-label">Avg Exam Score</div>
        </div>
      </div>

      <div className="admin-tabs">
        {['overview', 'activity'].map(t => (
          <button
            key={t}
            className={`admin-tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'overview' ? 'Users' : 'Recent Activity'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Sessions</th>
                <th>Exam Attempts</th>
                <th>Best Exam</th>
                <th>Avg Score</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {userList.map(u => {
                const avg = Math.round(u.scores.reduce((s, r) => s + r.percentage, 0) / u.scores.length)
                const bestExam = u.examScores.length > 0
                  ? Math.max(...u.examScores.map(r => r.percentage))
                  : null
                return (
                  <tr key={u.id}>
                    <td className="admin-user-name">{u.name}</td>
                    <td>{u.scores.length}</td>
                    <td>{u.examScores.length || '—'}</td>
                    <td>
                      {bestExam != null
                        ? <span className={bestExam >= 56 ? 'admin-pass' : 'admin-fail'}>{bestExam}%</span>
                        : '—'}
                    </td>
                    <td>{avg}%</td>
                    <td className="admin-date">{fmt(u.lastActive)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'activity' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Chapter</th>
                <th>Score</th>
                <th>%</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 100).map(r => (
                <tr key={r.id}>
                  <td className="admin-user-name">{r.display_name || r.user_id?.slice(0, 8)}</td>
                  <td>{CHAPTER_NAMES[r.chapter_id] || r.chapter_name}</td>
                  <td>{r.score}/{r.total}</td>
                  <td>
                    <span className={r.percentage >= 56 ? 'admin-pass' : 'admin-fail'}>
                      {r.percentage}%
                    </span>
                  </td>
                  <td className="admin-date">{fmt(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
