import { useState } from 'react'
import { supabase } from '../lib/supabase'

function fakeEmail(username) {
  return `${username.toLowerCase().replace(/\s+/g, '_')}@nce-study-app.com`
}

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!supabase) return
    setLoading(true)
    setError('')

    const email = fakeEmail(username)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: username } },
      })
      if (error) { setError(error.message); setLoading(false); return }
      setSuccess('Account created! You are now signed in.')
      setTimeout(onClose, 1200)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Incorrect username or password.')
        setLoading(false)
        return
      }
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">{mode === 'login' ? 'Sign In' : 'Create Account'}</h3>

        {success ? (
          <p style={{ color: '#4ade80', fontSize: 14 }}>{success}</p>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              className="modal-input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              minLength={2}
              autoComplete="username"
            />
            <input
              className="modal-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
            {error && <p className="modal-error">{error}</p>}
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </form>
        )}

        <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 4 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: 13 }}
            onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError('') }}
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}
