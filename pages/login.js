import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password
    })
    if (res.error) {
      setError('Invalid email or password')
    } else {
      router.push('/')
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>CMS Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email</label><br />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Password</label><br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '0.75rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Log In</button>
      </form>
    </div>
  )
}
