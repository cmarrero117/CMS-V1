import { useState } from 'react'
import Head from 'next/head'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'

const inp = {
  width: '100%', padding: '10px 12px', fontSize: '0.9rem',
  borderRadius: '8px', border: '1px solid #e5e7eb',
  boxSizing: 'border-box', background: '#fff', color: '#111827',
}

const label = {
  display: 'block', marginBottom: '0.4rem', fontWeight: 600,
  fontSize: '0.875rem', color: '#374151',
}

// Deterministic (no Math.random — must match on server + client render)
// diagonal streaks: same palette/speeds as before, just more of them,
// spread evenly down the page. Each line's delay is set as a fraction of
// its own duration (-(i/N)*duration) so start phases spread evenly across
// the whole population — that's what keeps many streaks crossing the
// screen at once instead of clustering on/off together.
const LINE_COUNT = 16
const LINE_PALETTE = [
  'rgba(79,70,229,0.22)',
  'rgba(32,178,170,0.18)',
  'rgba(79,70,229,0.16)',
  'rgba(32,178,170,0.22)',
  'rgba(79,70,229,0.18)',
  'rgba(32,178,170,0.16)',
]
const LINE_DURATIONS = [19, 27, 16, 31, 22, 25, 18, 29]

const LINES = Array.from({ length: LINE_COUNT }, (_, i) => {
  const duration = LINE_DURATIONS[i % LINE_DURATIONS.length]
  const jitter = i % 2 === 0 ? 0 : 3.1 // slight zigzag so spacing doesn't read as a rigid grid
  const top = (i * (100 / LINE_COUNT) + jitter) % 100
  const delay = -((i / LINE_COUNT) * duration)
  return {
    top: `${top.toFixed(1)}%`,
    duration,
    delay: Number(delay.toFixed(2)),
    color: LINE_PALETTE[i % LINE_PALETTE.length],
  }
})

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })
    if (res.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <>
      <Head>
        <style>{`
          .login-bg__line {
            position: absolute; left: -10%; width: 55vw; height: 1.5px;
            transform-origin: left center;
            background: linear-gradient(90deg, transparent, var(--line-color), transparent);
            animation-name: loginFlow;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            will-change: transform;
          }
          @keyframes loginFlow {
            0%   { transform: rotate(-24deg) translateX(-40vw); opacity: 0; }
            8%   { opacity: 1; }
            92%  { opacity: 1; }
            100% { transform: rotate(-24deg) translateX(130vw); opacity: 0; }
          }
          .login-bg__glow {
            position: absolute; top: 50%; left: 50%; width: 640px; height: 640px;
            margin: -320px 0 0 -320px; border-radius: 50%;
            background: radial-gradient(circle, rgba(79,70,229,0.16) 0%, rgba(79,70,229,0) 70%);
            animation: loginPulse 7s ease-in-out infinite;
          }
          @keyframes loginPulse {
            0%, 100% { opacity: 0.55; transform: scale(1); }
            50%      { opacity: 1;    transform: scale(1.12); }
          }
          @media (max-width: 640px) {
            .login-bg__line { width: 80vw; }
          }
        `}</style>
      </Head>

      <div style={{
        position: 'relative', overflow: 'hidden',
        minHeight: '100vh', background: '#f8f8fb',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
      }}>

        {/* ─── Living background: pulsing glow + flowing diagonal streaks ─── */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <div className="login-bg__glow" />
          {LINES.map((line, i) => (
            <div
              key={i}
              className="login-bg__line"
              style={{
                top: line.top,
                '--line-color': line.color,
                animationDuration: `${line.duration}s`,
                animationDelay: `${line.delay}s`,
              }}
            />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '380px' }}>

          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1.4rem', color: '#4f46e5', letterSpacing: '-0.5px' }}>Canvō</span>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2rem' }}>
            <h1 style={{ margin: '0 0 0.3rem', fontSize: '1.3rem', fontWeight: 700, color: '#111827' }}>Sign in</h1>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>Manage your site content and settings.</p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={label}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="you@example.com"
                  style={inp}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={label}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={inp}
                />
              </div>

              {error && (
                <div style={{
                  marginBottom: '1.25rem', padding: '10px 14px',
                  background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
                  color: '#b91c1c', fontSize: '0.85rem',
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '11px',
                  background: loading ? '#a5b4fc' : '#4f46e5',
                  color: '#fff', border: 'none', borderRadius: '8px',
                  fontSize: '0.9rem', fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  )
}
