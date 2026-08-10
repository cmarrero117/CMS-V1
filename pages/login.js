import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'

const inp = {
  width: '100%', padding: '10px 12px', fontSize: '0.9rem',
  borderRadius: '8px', border: '1px solid #e5e7eb',
  boxSizing: 'border-box', background: '#fff', color: '#111827',
  outline: 'none',
}

const label = {
  display: 'block', marginBottom: '0.4rem', fontWeight: 600,
  fontSize: '0.875rem', color: '#374151',
}

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
    <div style={{
      minHeight: '100vh', background: '#f8f8fb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>

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
  )
}
