import { useState } from 'react'
import { supabase } from '../lib/supabase'

function fakeEmail(username) {
  return `${username.toLowerCase().replace(/\s+/g, '_')}@nce-study-app.com`
}

export default function LandingPage() {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError('Incorrect username or password.'); setLoading(false); return }
    }
    setLoading(false)
  }

  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="landing-brand">
          <span className="landing-logo">📚</span>
          <h1 className="landing-title">NCE Study</h1>
        </div>
        <p className="landing-tagline">Master the NCE & CPCE with 493 flashcards and 200 quiz questions across 10 chapters.</p>
      </div>

      <div className="landing-auth">
        <div className="auth-tabs">
          <button
            className={`auth-tab${mode === 'login' ? ' active' : ''}`}
            onClick={() => { setMode('login'); setError('') }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab${mode === 'signup' ? ' active' : ''}`}
            onClick={() => { setMode('signup'); setError('') }}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
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
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>

      {/* Future content goes here */}
    </div>
  )
}
