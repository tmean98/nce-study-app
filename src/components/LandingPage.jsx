import { useState } from 'react'
import { supabase } from '../lib/supabase'

function fakeEmail(username) {
  return `${username.toLowerCase().replace(/\s+/g, '_')}@nce-study-app.com`
}

const FEATURES = [
  { num: '1,099', label: 'Quiz Questions' },
  { num: '493',   label: 'Flashcards' },
  { num: '10',    label: 'Chapters' },
  { num: '8',     label: 'CACREP Domains' },
]

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

      {/* ── Left branding panel ── */}
      <div className="landing-left">
        <div className="landing-brand">
          <svg width="28" height="31" viewBox="0 0 20 22" fill="none">
            <path d="M10 1L2 4.5V10.5C2 15.1 5.4 19.4 10 21C14.6 19.4 18 15.1 18 10.5V4.5L10 1Z" stroke="#D4A84F" strokeWidth="1.5" fill="none"/>
            <path d="M7 11L9 13L13 9" stroke="#D4A84F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <p className="landing-brand-name">NCE STUDY</p>
            <p className="landing-brand-sub">NU CMHC · Class of 2025</p>
          </div>
        </div>

        <div className="landing-headline">
          <h1 className="landing-title">Prepare<br />With Purpose.</h1>
          <p className="landing-tagline">
            Built for the Northwest University CMHC cohort of 2025 — your dedicated prep tool for the program qualifying exam.
          </p>
        </div>

        <div className="landing-features">
          {FEATURES.map(f => (
            <div key={f.label} className="landing-feature">
              <span className="landing-feature-num">{f.num}</span>
              <span className="landing-feature-label">{f.label}</span>
            </div>
          ))}
        </div>

      </div>

      {/* ── Right auth panel ── */}
      <div className="landing-right">
        <div className="landing-auth-card">

          <div className="auth-card-header">
            <h2 className="auth-card-title">
              {mode === 'login' ? 'Welcome back.' : 'Get started.'}
            </h2>
            <p className="auth-card-sub">
              {mode === 'login'
                ? 'Sign in to continue studying.'
                : 'Create your account to begin.'}
            </p>
          </div>

          <div className="auth-tabs-row">
            <button
              className={`auth-tab-btn${mode === 'login' ? ' active' : ''}`}
              onClick={() => { setMode('login'); setError('') }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab-btn${mode === 'signup' ? ' active' : ''}`}
              onClick={() => { setMode('signup'); setError('') }}
            >
              Sign Up
            </button>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <input
              className="auth-input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              minLength={2}
              autoComplete="username"
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="auth-cta" disabled={loading}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>

        </div>
      </div>

    </div>
  )
}
